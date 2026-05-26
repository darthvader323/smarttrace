import hashlib
import random
from datetime import datetime
from .models import SerialNumber,PackageHierarchy
from django.db import IntegrityError, transaction






def luhn_checksum(number: str) -> str:
    digits = [int(d) for d in number if d.isdigit()]
    odd_sum = sum(digits[-1::-2])
    even_sum = 0

    for d in digits[-2::-2]:
        doubled = d * 2
        even_sum += doubled if doubled < 10 else doubled - 9

    checksum = (odd_sum + even_sum) % 10
    return str((10 - checksum) % 10)


def validate_check_digit(serial: str) -> bool:
    digits = [d for d in serial if d.isdigit()]
    if len(digits) < 2:
        return False

    body = ''.join(digits[:-1])
    actual = digits[-1]
    return luhn_checksum(body) == actual


def generate_hash(
    serial: str,
    product_code: str,
    production_date: str,
    secret="SMARTTRACE"
):
    raw = f"{serial}{production_date}{product_code}{secret}"
    return hashlib.sha256(raw.encode()).hexdigest()



def generate_sscc(company_prefix: str, sequence: int, extension: str = "0") -> str:
    digits = "".join(filter(str.isdigit, company_prefix))
    digits = digits[:10].rjust(7, "0")
    serial_ref_length = 17 - len(digits)
    serial_ref = str(sequence).zfill(serial_ref_length)
    base = f"{extension}{digits}{serial_ref}"
    check_digit = luhn_checksum(base)
    return f"{base}{check_digit}"


def generate_serials(product, level, quantity, company_prefix="STX"):

    serial_objects = []

    production_date = datetime.utcnow().strftime("%Y%m%d")
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    last_count = SerialNumber.objects.count()

    for i in range(quantity):
        sequence = last_count + i + 1

        if level == "TERTIARY":
            full_serial = generate_sscc(company_prefix, sequence)
            check_digit = full_serial[-1]
        else:
            base = f"{company_prefix}{timestamp}{sequence:06d}"
            check_digit = luhn_checksum(base)
            full_serial = f"{base}{check_digit}"

        hash_value = generate_hash(full_serial, product.product_code, production_date)

        serial_objects.append(
            SerialNumber(
                serial=full_serial,
                product=product,
                level=level,
                check_digit=check_digit,
                hash_value=hash_value
            )
        )

    # ⚡ BULK INSERT
    try:
        with transaction.atomic():
            SerialNumber.objects.bulk_create(serial_objects)
    except IntegrityError:
        return generate_serials(product, level, quantity, company_prefix)

    return serial_objects
def generate_batch(product, total_units, units_per_carton, cartons_per_pallet):

    with transaction.atomic():

        # 1️⃣ Generate primary units
        units = generate_serials(product, "PRIMARY", total_units)

        cartons = []
        pallets = []

        # 2️⃣ Create cartons
        for i in range(0, total_units, units_per_carton):

            carton = generate_serials(product, "SECONDARY", 1)[0]
            cartons.append(carton)

            for unit in units[i:i + units_per_carton]:

                PackageHierarchy.objects.create(
                    parent=carton,
                    child=unit
                )

        # 3️⃣ Create pallets
        for i in range(0, len(cartons), cartons_per_pallet):

            pallet = generate_serials(product, "TERTIARY", 1)[0]
            pallets.append(pallet)

            for carton in cartons[i:i + cartons_per_pallet]:

                PackageHierarchy.objects.create(
                    parent=pallet,
                    child=carton
                )

    return {
        "units": len(units),
        "cartons": len(cartons),
        "pallets": len(pallets)
    }