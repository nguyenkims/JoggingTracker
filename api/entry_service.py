from datetime import datetime

from flask import jsonify, g, request

from api import app, get_logger
from api.auth_service import auth, get_error
from api.models import Entry

logger = get_logger(__name__)


@app.route("/entry/create", methods=['GET', 'POST'])
@auth.login_required
def add_entry():
    date = request.form.get("date")
    distance = request.form.get("distance")
    time = request.form.get("time")

    if not date or not distance or not time:
        return get_error("date, distance, time must be provided"), 400

    try:
        date = datetime.strptime(date, '%Y-%m-%d')
    except ValueError:  # parsing fails
        return get_error("date must be of format day/month/year, for ex 2000-12-31"), 400

    try:
        distance = float(distance)
        time = float(time)
    except ValueError:
        return get_error("distance and time must use international float format, for ex: 1.2, 1.34E4"), 400

    entry = Entry(user=g.user, date=date, distance=distance, time=time)
    entry.create()

    logger.info("Create new entry:%s", entry)

    return jsonify(get_entry_info(entry)), 201


@app.route("/entry/all", methods=['GET', 'POST'])
@auth.login_required
def get_all_entries():
    entries = []
    for entry in g.user.entries:
        entries.append(get_entry_info(entry))
    return jsonify({"data": entries}), 200


def get_entry_info(entry):
    return {"date": str(entry.date), "distance": str(entry.distance), "time": str(entry.time)}
