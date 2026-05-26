from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    product_code = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.product_code})"


class SerialNumber(models.Model):

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("EXPIRED", "Expired"),
        ("RECALLED", "Recalled"),
    ]

    LEVEL_CHOICES = [
        ("PRIMARY", "Primary"),
        ("SECONDARY", "Secondary"),
        ("TERTIARY", "Tertiary"),
    ]

    serial = models.CharField(max_length=255, unique=True)

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES
    )

    check_digit = models.CharField(max_length=5)

    hash_value = models.CharField(max_length=64)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.serial


class PackageHierarchy(models.Model):

    parent = models.ForeignKey(
        SerialNumber,
        on_delete=models.CASCADE,
        related_name="children"
    )

    child = models.ForeignKey(
        SerialNumber,
        on_delete=models.CASCADE,
        related_name="parent_link"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("parent", "child")

    def clean(self):

        if self.parent == self.child:
            raise ValidationError(
                "A serial cannot be its own parent or child."
            )

    def save(self, *args, **kwargs):

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.parent.serial} -> {self.child.serial}"


class ScanLog(models.Model):

    RESULT_CHOICES = [
        ("VALID", "Valid"),
        ("INVALID", "Invalid"),
        ("SUSPECT", "Suspect"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    serial = models.ForeignKey(
        SerialNumber,
        on_delete=models.SET_NULL,
        related_name="scans",
        null=True,
        blank=True
    )

    raw_serial = models.CharField(
        max_length=255,
        blank=True
    )

    serial_status = models.CharField(
        max_length=20,
        blank=True
    )

    scan_result = models.CharField(
        max_length=20,
        choices=RESULT_CHOICES,
        default="VALID"
    )

    scanned_at = models.DateTimeField(
        auto_now_add=True
    )

    location = models.CharField(
        max_length=255,
        blank=True
    )

    def __str__(self):

        return (
            f"Scan of "
            f"{self.raw_serial or self.serial} "
            f"scanned at {self.scanned_at}"
        )