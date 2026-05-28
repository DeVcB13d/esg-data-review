from django.db import models

class RawUtilityBill(models.Model):
    tenant_id = models.CharField(max_length=50, default='default-tenant')
    account_id = models.CharField(max_length=100, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    total_kwh = models.FloatField(null=True, blank=True)
    total_cost = models.FloatField(null=True, blank=True)
    raw_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class RawTravelData(models.Model):
    tenant_id = models.CharField(max_length=50, default='default-tenant')
    trip_id = models.CharField(max_length=100, null=True, blank=True)
    traveler_id = models.CharField(max_length=100, null=True, blank=True)
    segment_type = models.CharField(max_length=50, null=True, blank=True)
    origin = models.CharField(max_length=10, null=True, blank=True)
    destination = models.CharField(max_length=10, null=True, blank=True)
    raw_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

class RawSAPData(models.Model):
    tenant_id = models.CharField(max_length=50, default='default-tenant')
    ebeln = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    quantity = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=20, null=True, blank=True)
    material_description = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class NormalizedEmission(models.Model):
    SCOPE_CHOICES = [
        ('Scope 1', 'Scope 1'),
        ('Scope 2', 'Scope 2'),
        ('Scope 3', 'Scope 3'),
    ]
    STATUS_CHOICES = [
        ('Pending Review', 'Pending Review'),
        ('Approved', 'Approved'),
        ('Flagged', 'Flagged'),
    ]
    tenant_id = models.CharField(max_length=50, default='default-tenant')
    source_type = models.CharField(max_length=50) # Utility, Navan, SAP
    raw_record_id = models.IntegerField(null=True, blank=True) # Points to PK of raw table
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    consumption_value = models.FloatField()
    unit = models.CharField(max_length=20) # kWh, km, L, KG
    date = models.DateField(null=True, blank=True)
    cost = models.FloatField(null=True, blank=True)
    reference_id = models.CharField(max_length=100, null=True, blank=True) # Meter ID, Trip ID, PO Number
    
    # Audit Trail
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending Review')
    is_edited = models.BooleanField(default=False)
    last_edited_by = models.CharField(max_length=100, null=True, blank=True)
    last_edited_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
