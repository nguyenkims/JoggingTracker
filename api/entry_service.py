from datetime import datetime

from flask import jsonify, g, request

from api import app, get_logger
from api.auth_service import auth, get_error, get_data
from api.models import Entry

logger = get_logger(__name__)


@app.route("/entry/create", methods=['GET', 'POST'])
@auth.login_required
def add_entry():
    data = get_data(request)
    date = data.get("date")  # in millisecs
    distance = data.get("distance")
    time = data.get("time")

    if not date or not distance or not time:
        return get_error("date, distance, time must be provided"), 400

    try:
        date = int(date)
        date = datetime.utcfromtimestamp(date // 1000)
    except ValueError:  # year is out of range for example
        return get_error("date is maybe too big."), 400

    try:
        distance = float(distance)
        time = float(time)
    except ValueError:
        return get_error("distance and time must use international float format, for ex: 1.2, 1.34E4"), 400

    entry = Entry(user=g.user, date=date, distance=distance, time=time)
    entry.create()

    logger.info("Create new entry:%s", entry)

    return jsonify(get_entry_info(entry)), 201


@app.route("/entry/delete", methods=['GET', 'POST'])
@auth.login_required
def delete_entry():
    data = get_data(request)
    entry_id = int(data.get("id"))
    entry_to_delete = None
    for entry in g.user.entries:
        if entry.id == entry_id:
            entry_to_delete = entry
            break

    if entry_to_delete:
        entry_to_delete.delete()
        return jsonify({"message": "delete successfully entry:" + str(entry_id)}), 200
    else:
        return get_error("cannot delete entry:" + str(entry_id)), 400


@app.route("/entry/all", methods=['GET', 'POST'])
@auth.login_required
def get_all_entries():
    entries = []
    for entry in g.user.entries:
        entries.append(get_entry_info(entry))
    return jsonify({"data": entries}), 200


epoch = datetime.utcfromtimestamp(0)


def get_entry_info(entry):
    milliSecs = (entry.date - epoch).total_seconds() * 1000
    return {"id": entry.id, "date": int(milliSecs), "distance": entry.distance, "time": entry.time}
