from math import radians, sin, cos, sqrt, atan2


def calculate_distance_meters(lat1, lon1, lat2, lon2):
    earth_radius_m = 6371000

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earth_radius_m * c


def validate_gps_lock(user_lat, user_lng, alert_lat, alert_lng, allowed_radius_m=50):
    distance = calculate_distance_meters(
        user_lat,
        user_lng,
        alert_lat,
        alert_lng
    )

    return {
        "allowed": distance <= allowed_radius_m,
        "distanceMeters": round(distance, 2),
        "allowedRadiusMeters": allowed_radius_m,
        "message": (
            "GPS verified. Officer is within allowed inspection radius."
            if distance <= allowed_radius_m
            else "GPS validation failed. Officer must be within 50 meters of alert location."
        )
    }