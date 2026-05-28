from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Place


AREA_COORDS = {
    "Banjara Hills": (17.4156, 78.4372, 38, 48),
    "Jubilee Hills": (17.4326, 78.4090, 22, 32),
    "Madhapur": (17.4483, 78.3915, 74, 44),
    "Hitech City": (17.4474, 78.3784, 64, 60),
    "Gachibowli": (17.4401, 78.3489, 82, 52),
    "Kondapur": (17.4697, 78.3578, 79, 38),
    "Kukatpally": (17.4948, 78.3996, 62, 18),
    "Ameerpet": (17.4375, 78.4483, 28, 62),
    "Secunderabad": (17.4435, 78.4983, 57, 26),
    "Old City": (17.3616, 78.4747, 10, 78),
    "Begumpet": (17.4447, 78.4664, 45, 37),
    "Abids": (17.3898, 78.4766, 31, 74),
    "Koti": (17.3850, 78.4867, 36, 72),
    "Dilsukhnagar": (17.3688, 78.5247, 54, 80),
    "Manikonda": (17.4000, 78.3762, 76, 64),
    "Nallagandla": (17.4752, 78.3091, 91, 42),
    "Tolichowki": (17.3984, 78.4110, 21, 61),
    "Mehdipatnam": (17.3940, 78.4427, 24, 70),
    "Sainikpuri": (17.4986, 78.5527, 72, 13),
    "Kompally": (17.5385, 78.4814, 49, 9),
}

CATEGORY_PROFILES = {
    "biryani": {
        "emoji": "🍛",
        "restaurant_type": "family place",
        "cuisines": ["Hyderabadi", "Biryani"],
        "tags": ["biryani", "dum", "spicy", "family-friendly"],
        "occasions": ["biryani-run", "team-lunch", "family-dinner"],
        "names": [
            "Paradise",
            "Shah Ghouse",
            "Bawarchi",
            "Meridian",
            "Cafe Bahar",
            "Pista House",
            "Grand Hotel",
            "Nayaab",
            "Mehfil",
            "Hotel Shadab",
            "Spice Junction",
            "Dum Darbar",
            "Deccan Biryani House",
            "Nizam's Kitchen",
            "Charcoal Biryani Co",
            "Royal Dum House",
            "Hyderabadi Handi",
        ],
    },
    "tiffin": {
        "emoji": "🥘",
        "restaurant_type": "tiffins",
        "cuisines": ["South Indian", "Breakfast"],
        "tags": ["dosa", "idli", "breakfast", "value"],
        "occasions": ["breakfast", "budget", "team-lunch"],
        "names": [
            "Chutneys",
            "Minerva Coffee Shop",
            "Ram Ki Bandi",
            "Taaza Kitchen",
            "Pragati Tiffins",
            "Govind Dosa",
            "Udupi Upahar",
            "Varalakshmi Tiffins",
            "Dosa Factory",
            "Morning Plate",
            "Ghee Karam Tiffins",
            "Tiffin Theory",
            "Andhra Tiffin Room",
            "Steam & Sambar",
            "Idli Street",
            "Pesarattu Point",
            "South Spoon",
        ],
    },
    "cafe": {
        "emoji": "☕",
        "restaurant_type": "cafe",
        "cuisines": ["Cafe", "Bakery"],
        "tags": ["coffee", "dessert", "wifi", "casual"],
        "occasions": ["date", "work-from-cafe", "chai-break"],
        "names": [
            "Nimrah Cafe",
            "Roastery Coffee House",
            "Autumn Leaf Cafe",
            "Concu",
            "The Hole In The Wall",
            "Cafe Niloufer",
            "Third Wave Coffee",
            "Ministry of Chai",
            "Cream Stone",
            "Labonel",
            "Coffee Cup",
            "Karafa Cafe",
            "Chai Kahani",
            "Brew Room",
            "Makers of Milkshakes",
            "Cafe Eclat",
            "Little Things Cafe",
        ],
    },
    "rooftop": {
        "emoji": "🌃",
        "restaurant_type": "restro bar",
        "cuisines": ["Modern Indian", "Continental", "Cocktails"],
        "tags": ["rooftop", "views", "cocktails", "upscale"],
        "occasions": ["date", "rooftop", "party"],
        "names": [
            "Farzi Cafe",
            "Over The Moon",
            "Aqua",
            "Air Live",
            "Altitude Lounge",
            "Broadway",
            "Skyhy",
            "Olive Bistro",
            "Rooftop Republic",
            "Cloud Dining",
            "Terrace Tales",
            "High Street Social",
            "Skyline Kitchen",
            "Moon Deck",
            "The Glasshouse",
            "Aura Terrace",
            "City Lights Bar",
        ],
    },
    "pub": {
        "emoji": "🍺",
        "restaurant_type": "pub",
        "cuisines": ["Pub food", "Continental"],
        "tags": ["pub", "music", "cocktails", "after work"],
        "occasions": ["party", "after-work", "team-lunch"],
        "names": [
            "10 Downing St",
            "Prost",
            "Heart Cup Coffee",
            "Zero40 Brewing",
            "Broadway Brewery",
            "By The Bottle",
            "Fat Pigeon",
            "Lord of the Drinks",
            "The Hoppery",
            "Prism Club",
            "Bar Project",
            "Tap House",
            "Mugshot Lounge",
            "Social Brew",
            "Nightjar",
            "The Local Bar",
            "Hop Street",
        ],
    },
    "street": {
        "emoji": "🌮",
        "restaurant_type": "street food",
        "cuisines": ["Street food", "Snacks"],
        "tags": ["chaat", "budget", "quick bite", "local"],
        "occasions": ["budget", "old-city-walk", "late-night"],
        "names": [
            "Gokul Chat",
            "Maharaja Chat",
            "Sindhi Colony Momos",
            "DLF Street Eats",
            "Charminar Kebab Lane",
            "Mayur Pan House",
            "Sardarji's Chaat",
            "Tibbs Frankie",
            "Bombay Juice",
            "Pani Puri Point",
            "Kebab Cart",
            "Rolls Junction",
            "Chaat Bazaar",
            "Evening Adda",
            "Old City Snacks",
            "Momo Street",
            "Grill Cart",
        ],
    },
}

FEATURED_PLACES = [
    {
        "name": "Paradise",
        "area": "Secunderabad",
        "category": "biryani",
        "restaurant_type": "family place",
        "cuisines": ["Hyderabadi", "Biryani"],
        "tags": ["dum biryani", "iconic", "must-try", "Open now", "Legend"],
        "occasions": ["family-dinner", "team-lunch", "biryani-run"],
        "emoji": "🍛",
        "latitude": 17.4435,
        "longitude": 78.4983,
        "map_x": 57,
        "map_y": 26,
        "rating": 4.9,
        "reviews_count": 8900,
        "score": 9.4,
        "food_score": 4.9,
        "ambience_score": 3.8,
        "service_score": 4.5,
        "value_score": 4.8,
        "wait_score": 3.2,
        "ai_summary": "People swear by the dum biryani. Ambience is old-school and functional. Long queues on weekends but usually worth it.",
    },
    {
        "name": "Nimrah Cafe",
        "area": "Old City",
        "category": "cafe",
        "restaurant_type": "irani cafe",
        "cuisines": ["Irani chai", "Bakery"],
        "tags": ["irani chai", "osmania biscuits", "iconic", "Open till late"],
        "occasions": ["old-city-walk", "chai-break", "budget"],
        "emoji": "☕",
        "latitude": 17.3616,
        "longitude": 78.4747,
        "map_x": 10,
        "map_y": 78,
        "rating": 4.7,
        "reviews_count": 3200,
        "score": 8.9,
        "food_score": 4.7,
        "ambience_score": 4.2,
        "service_score": 4.1,
        "value_score": 4.9,
        "wait_score": 3.8,
        "ai_summary": "The classic Irani chai experience near Charminar. Osmania biscuits are mandatory and late-night crowds are part of the charm.",
    },
    {
        "name": "Farzi Cafe",
        "area": "Banjara Hills",
        "category": "rooftop",
        "restaurant_type": "restro bar",
        "cuisines": ["Modern Indian", "Cocktails"],
        "tags": ["rooftop", "molecular", "cocktails", "upscale"],
        "occasions": ["date", "rooftop", "party"],
        "emoji": "🌃",
        "latitude": 17.4156,
        "longitude": 78.4372,
        "map_x": 38,
        "map_y": 48,
        "rating": 4.5,
        "reviews_count": 2100,
        "score": 8.7,
        "food_score": 4.4,
        "ambience_score": 4.8,
        "service_score": 4.3,
        "value_score": 3.9,
        "wait_score": 4.0,
        "ai_summary": "A polished date-night option with city views, theatrical plates, and strong cocktails. Book ahead on weekends.",
    },
    {
        "name": "Chutneys",
        "area": "Jubilee Hills",
        "category": "tiffin",
        "restaurant_type": "tiffins",
        "cuisines": ["South Indian", "Breakfast"],
        "tags": ["dosas", "tiffin", "breakfast", "family-friendly", "Open early"],
        "occasions": ["breakfast", "family-dinner", "team-lunch"],
        "emoji": "🥘",
        "latitude": 17.4326,
        "longitude": 78.4090,
        "map_x": 22,
        "map_y": 32,
        "rating": 4.8,
        "reviews_count": 5400,
        "score": 9.1,
        "food_score": 4.8,
        "ambience_score": 4.0,
        "service_score": 4.4,
        "value_score": 4.7,
        "wait_score": 3.5,
        "ai_summary": "A dependable South Indian breakfast pick. Go early if you want shorter waits and fresher dosa energy.",
    },
    {
        "name": "10 Downing St",
        "area": "Hitech City",
        "category": "pub",
        "restaurant_type": "pub",
        "cuisines": ["Pub food", "Continental"],
        "tags": ["pub", "live music", "cocktails", "after work"],
        "occasions": ["party", "team-lunch", "after-work"],
        "emoji": "🍺",
        "latitude": 17.4474,
        "longitude": 78.3784,
        "map_x": 64,
        "map_y": 60,
        "rating": 4.3,
        "reviews_count": 1800,
        "score": 8.2,
        "food_score": 4.1,
        "ambience_score": 4.6,
        "service_score": 4.2,
        "value_score": 3.8,
        "wait_score": 4.1,
        "ai_summary": "A reliable after-work pub for Hitech City. Best when the group wants music, snacks, and easy drinks.",
    },
    {
        "name": "Shah Ghouse",
        "area": "Old City",
        "category": "biryani",
        "restaurant_type": "quick service",
        "cuisines": ["Hyderabadi", "Biryani", "Haleem"],
        "tags": ["biryani", "haleem", "budget", "no-frills"],
        "occasions": ["biryani-run", "budget", "old-city-walk"],
        "emoji": "🍛",
        "latitude": 17.3578,
        "longitude": 78.4740,
        "map_x": 8,
        "map_y": 65,
        "rating": 4.6,
        "reviews_count": 6700,
        "score": 9.0,
        "food_score": 4.8,
        "ambience_score": 3.2,
        "service_score": 3.9,
        "value_score": 4.9,
        "wait_score": 3.0,
        "ai_summary": "No-frills biryani with serious local loyalty. Great value, busy counters, and excellent haleem in season.",
    },
]


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def build_generated_places() -> list[dict]:
    places = [dict(place) for place in FEATURED_PLACES]
    areas = list(AREA_COORDS.items())
    categories = list(CATEGORY_PROFILES.items())
    target_total = 108

    i = 0
    while len(places) < target_total:
        category, profile = categories[i % len(categories)]
        area, (lat, lng, map_x, map_y) = areas[(i * 3 + i // len(categories)) % len(areas)]
        name_root = profile["names"][(i // len(categories)) % len(profile["names"])]
        branch_suffix = "" if not any(p["name"] == name_root and p["area"] == area for p in places) else f" {area}"
        rating = round(4.05 + ((i * 7) % 10) * 0.08, 1)
        score = round(clamp(7.4 + ((i * 11) % 18) * 0.12, 7.2, 9.5), 1)
        x_offset = ((i % 5) - 2) * 1.4
        y_offset = (((i // 5) % 5) - 2) * 1.2
        coord_offset = ((i % 7) - 3) * 0.0021

        places.append(
            {
                "name": f"{name_root}{branch_suffix}",
                "area": area,
                "category": category,
                "restaurant_type": profile["restaurant_type"],
                "cuisines": list(profile["cuisines"]),
                "tags": list(dict.fromkeys([*profile["tags"], area, "Open now" if i % 4 else "Trending"])),
                "occasions": list(profile["occasions"]),
                "emoji": profile["emoji"],
                "latitude": round(lat + coord_offset, 6),
                "longitude": round(lng - coord_offset, 6),
                "map_x": round(clamp(map_x + x_offset, 5, 95), 2),
                "map_y": round(clamp(map_y + y_offset, 6, 88), 2),
                "rating": rating,
                "reviews_count": 450 + ((i * 173) % 8200),
                "score": score,
                "food_score": round(clamp(rating + 0.1 - (i % 3) * 0.08, 3.6, 5.0), 1),
                "ambience_score": round(clamp(3.5 + ((i * 5) % 15) * 0.1, 3.2, 4.9), 1),
                "service_score": round(clamp(3.6 + ((i * 4) % 13) * 0.1, 3.3, 4.8), 1),
                "value_score": round(clamp(3.7 + ((i * 6) % 14) * 0.1, 3.4, 5.0), 1),
                "wait_score": round(clamp(2.8 + ((i * 8) % 17) * 0.1, 2.7, 4.7), 1),
                "ai_summary": (
                    f"{name_root} in {area} is a strong {category.replace('-', ' ')} pick for "
                    f"{', '.join(profile['occasions'][:2]).replace('-', ' ')}. "
                    "Use the filters and heatmap to compare it with nearby options."
                ),
            }
        )
        i += 1

    return places


SEED_PLACES = build_generated_places()


async def seed_database(session: AsyncSession) -> None:
    existing_count = await session.scalar(select(func.count(Place.id)))
    existing_names = set((await session.scalars(select(Place.name))).all())
    missing_places = [place for place in SEED_PLACES if place["name"] not in existing_names]

    if not missing_places and existing_count >= 100:
        return

    session.add_all(Place(**place) for place in missing_places)
    await session.commit()
