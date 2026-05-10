from django.db import models
from django.contrib.auth.models import User


# Create your models here.

class Product(models.Model):
    name=models.CharField(max_length=255)
    description=models.TextField(blank=True)
    product_code=models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.product_code})"

class SerialNumber(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("EXPIRED", "Expired"),
        ("RECALLED", "Recalled"),
    ]
    LEVEL_CHOICES = [
        ('PRIMARY', 'Primary'),
        ('SECONDARY', 'Secondary'),
        ('TERTIARY', 'Tertiary'),
    ]
    serial=models.CharField(max_length=255,unique=True)
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    level=models.CharField(max_length=20,choices=LEVEL_CHOICES)
    check_digit=models.CharField(max_length=5)
    hash_value=models.CharField(max_length=64)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )
    created_at=models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.serial

class PackageHierarchy(models.Model):
    parent=models.ForeignKey(SerialNumber,on_delete=models.CASCADE,related_name='children')
    child=models.ForeignKey(SerialNumber,on_delete=models.CASCADE,related_name='parent_link')
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.parent.serial} -> {self.child.serial}"   
    
class ScanLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    serial=models.ForeignKey(SerialNumber,on_delete=models.CASCADE,related_name='scans')
    scanned_at=models.DateTimeField(auto_now_add=True)
    location=models.CharField(max_length=255,blank=True)
    def __str__(self):
        return f"Scan of {self.serial.serial} scanned at {self.scanned_at}"


