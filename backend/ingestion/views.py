import os
import json
import math
import pandas as pd
import pdfplumber
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.response import Response

from google import genai
from google.genai import types

from .models import RawUtilityBill, RawTravelData, RawSAPData, NormalizedEmission

AIRPORT_COORDINATES = {
    "BLR": (13.1986, 77.7066),
    "FRA": (50.0379, 8.5622),
    "JFK": (40.6413, -73.7781),
    "SFO": (37.6188, -122.3758),
    "LHR": (51.4700, -0.4543),
}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@api_view(['POST'])
@parser_classes([MultiPartParser])
def ingest_utility(request):
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({"error": "No file provided"}, status=400)
    
    text = ""
    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
                
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        return Response({"error": "GEMINI_API_KEY environment variable not set. Please set it in the backend environment."}, status=500)
    
    try:
        client = genai.Client(api_key=api_key)
        prompt = "Extract the following fields from this raw utility bill text and return them in a strict JSON format: account_id, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), total_kwh (float), total_cost (float). Ignore KVA or Demand charges.\n\nText: " + text
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        data = json.loads(response.text)
    except Exception as e:
        return Response({"error": f"LLM extraction failed: {str(e)}"}, status=500)
        
    # Save Raw Data
    raw_record = RawUtilityBill.objects.create(
        account_id=data.get('account_id'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        total_kwh=data.get('total_kwh'),
        total_cost=data.get('total_cost'),
        raw_text=text
    )
    
    # Save Normalized Data
    NormalizedEmission.objects.create(
        tenant_id='default-tenant',
        source_type='Utility',
        raw_record_id=raw_record.id,
        scope='Scope 2',
        consumption_value=data.get('total_kwh', 0),
        unit='kWh',
        date=data.get('end_date'),
        cost=data.get('total_cost'),
        reference_id=data.get('account_id')
    )
    
    return Response({"status": "success", "extracted_data": data})

@api_view(['POST'])
@parser_classes([JSONParser])
def ingest_navan(request):
    data = request.data
    
    trip_id = data.get('trip_id') or data.get('booking_id')
    traveler_id = data.get('traveler_id')
    segment_type = data.get('segment_type', '').lower()
    
    origin = data.get('origin')
    destination = data.get('destination')
    
    # Save Raw
    raw_record = RawTravelData.objects.create(
        tenant_id='default-tenant',
        trip_id=trip_id,
        traveler_id=traveler_id,
        segment_type=segment_type,
        origin=origin,
        destination=destination,
        raw_json=data
    )
    
    distance_km = 0.0
    if segment_type == 'flight' and origin and destination:
        coords_origin = AIRPORT_COORDINATES.get(origin.upper())
        coords_dest = AIRPORT_COORDINATES.get(destination.upper())
        if coords_origin and coords_dest:
            distance_km = haversine(coords_origin[0], coords_origin[1], coords_dest[0], coords_dest[1])
            
    # Normalize
    if distance_km > 0:
        NormalizedEmission.objects.create(
            tenant_id='default-tenant',
            source_type='Travel',
            raw_record_id=raw_record.id,
            scope='Scope 3',
            consumption_value=distance_km,
            unit='km',
            date=data.get('check_out') or data.get('flight_date') or datetime.now().date(),
            reference_id=trip_id
        )
        
    return Response({"status": "success", "distance_km": distance_km})

@api_view(['POST'])
@parser_classes([MultiPartParser])
def ingest_sap(request):
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({"error": "No file provided"}, status=400)
    
    try:
        df = pd.read_csv(file_obj)
    except Exception as e:
        return Response({"error": f"Failed to parse CSV: {str(e)}"}, status=400)
        
    records_processed = 0
    
    for index, row in df.iterrows():
        # Attempt to map columns flexibly since we don't know the exact names yet
        ebeln = row.get('EBELN', row.get('ebeln', ''))
        
        # Try to find a date column
        date_val = None
        for col in ['BEDAT', 'AEDAT', 'date', 'Date']:
            if col in row and pd.notnull(row[col]):
                date_val = row[col]
                break
                
        # Try to find quantity
        qty_val = 0.0
        for col in ['MENGE', 'quantity', 'Quantity']:
            if col in row and pd.notnull(row[col]):
                qty_val = float(row[col])
                break
                
        # Try to find unit
        unit_val = ''
        for col in ['MEINS', 'unit', 'Unit']:
            if col in row and pd.notnull(row[col]):
                unit_val = str(row[col]).strip()
                break
                
        # Try to find material description
        desc_val = ''
        for col in ['TXZ01', 'material', 'description']:
            if col in row and pd.notnull(row[col]):
                desc_val = str(row[col])
                break
                
        # Convert pandas date to python date if valid
        try:
            if date_val:
                date_obj = pd.to_datetime(date_val).date()
            else:
                date_obj = None
        except:
            date_obj = None
            
        raw_record = RawSAPData.objects.create(
            tenant_id='default-tenant',
            ebeln=ebeln,
            date=date_obj,
            quantity=qty_val,
            unit=unit_val,
            material_description=desc_val
        )
        
        # Standardize units
        normalized_unit = unit_val.upper()
        if normalized_unit == 'GAL':
            qty_val *= 3.78541
            normalized_unit = 'L'
            
        NormalizedEmission.objects.create(
            tenant_id='default-tenant',
            source_type='SAP',
            raw_record_id=raw_record.id,
            scope='Scope 3', # Defaulting to Scope 3 for purchased goods
            consumption_value=qty_val,
            unit=normalized_unit,
            date=date_obj,
            reference_id=ebeln
        )
        records_processed += 1
        
    return Response({"status": "success", "records_processed": records_processed})
