#==============================
# App.py - DAY-SCREEN MAIN FILE
#==============================

import sys, os, csv, json, threading, time, math
from datetime import datetime

sys.path.insert(2, '/home/s3svc/Desktop/Sobe_Sunset/Commissioning/Software/VCC/run')
sys.path.insert(3, '/home/s3svc/Desktop/Sobe_Sunset/Commissioning/Software/Classes')

from sobe_classes_vcc import vccClass
from vc_header import VCC_ID, config_file

from flask import Flask, request, render_template, jsonify
app = Flask(__name__)

DATA_PATH = '/home/s3svc/Desktop/Sobe_Sunset/Commissioning/Software/VCC/frontend/day_screen/data'


#==============================
# Initialize VCC

def get_csv_config_info(key):
    # config_file = '/home/s3svc/Desktop/Sobe_Sunset/Commissioning/Configuration/CX_config.csv'
    with open(config_file, 'r') as f:
        reader = csv.DictReader(f)
        for row_dict in reader:
            if key in row_dict.keys():
                info = row_dict[key]
                # print(info)
                return info
    return None

VCC_IP = get_csv_config_info('vcc_ip')
VCC = vccClass(VCC_ID, VCC_IP, database=True, frontend=True)

#==============================
# Initialize cached layouts

def load_data(json_name):
    path = DATA_PATH + "/" + json_name + ".json"
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return None

layouts_cache = {}

def load_layouts_cache():
    global layouts_cache
    layouts_cache = load_data("layouts")
    return

#load_layouts() # Call this whenever re-cache needed (after edit)


def save_layouts_cache():
    path = DATA_PATH + "/" + "layouts" + ".json"
    try:
        now_formatted = datetime.now().strftime("%y-%m-%d %H:%M")

        # Update the last_updated field
        if 'info' in layouts_cache:
            layouts_cache['info']['last_updated'] = now_formatted

        # Write the updated cache to the JSON file
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(layouts_cache, f, indent=4)

        print("Layouts cache saved successfully.")
        return True
    except Exception as e:
        print(f"Error saving layouts cache: {e}")
        return False



#==============================
# Checking from client for update in certain layout

@app.route("/check-layout-update")
def check_layout_update():
    layout_name = request.args.get("layout_name")
    client_version = int(request.args.get("version", 0))

    layout_entry = layouts_cache["layouts"].get(layout_name)
    if not layout_entry:
        return {"error": "unknown layout"}, 404

    return {
        "update_required": layout_entry["version"] > client_version,
        "version": layout_entry["version"]
    }



#==============================
# Render layout menu

@app.route("/edit_layout")
def edit_layout():
    layout_name = request.args.get("layout_name")

@app.route("/create_layout")
def create_layout():
    global layouts_cache
    name = request.args.get("name")
    #if not name:
    #    return jsonify({'error': 'No layout name provided'}), 400

    # Check if a layout with the same name already exists
    if any(layout['name'] == name for layout in layouts_cache['layouts']):
        return jsonify({'error': 'Layout name already exists'}), 400

    # Generate current timestamp
    now = datetime.now().strftime("%y-%m-%d %H:%M")

    # Create the new layout structure
    new_layout = {
        "name": name,
        "date_created": now,
        "date_updated": now,
        "scale": 100,
        "contents": []
    }

    # Insert at the top of the list
    layouts_cache['layouts'].insert(0, new_layout)

    # Save to JSON file
    save_layouts_cache()

    return jsonify({'message': 'Layout created', 'layout': new_layout}), 200

@app.route("/delete_layout")
def delete_layout():
    global layouts_cache
    layout_name = request.args.get("layout_name")
    if not layout_name:
        return jsonify({'error': 'No layout name provided'}), 400

    # Find the layout to delete
    layout_to_delete = next((layout for layout in layouts_cache['layouts'] if layout['name'] == layout_name), None)
    if not layout_to_delete:
        return jsonify({'error': 'Layout not found'}), 404

    # Remove the layout from the list
    layouts_cache['layouts'].remove(layout_to_delete)

    # Save to JSON file
    save_layouts_cache()

    return jsonify({'message': 'Layout deleted', 'layout': layout_to_delete}), 200

#==============================
# Render layout menu

@app.route("/layout_list")
def layout_list():
    global layouts_cache
    load_layouts_cache()
    currentLayout = request.args.get("current_layout")
    starlayout = request.args.get("star_layout")
    layoutList = layouts_cache["layouts"]
    return render_template(
        "layouts.html",
        layouts = layoutList,
        star_layout = starlayout,
        currentLayout=currentLayout
    )


#==============================
# Load widget library from separate html file - store in index.html and clone

@app.route("/widget_library")
def widget_library():
    return render_template(
        "widget-library.html"
    )















#==============================
# Load Table

@app.route("/browse_subsystem")
def browse_subsystem():
    page = int(request.args.get("page", 0))
    subsystem = request.args.get("subsystem", "")
    page_size = int(request.args.get("size", 8))
    search_string = ""

    query_str = "SELECT c.description, v.cur_state, c.display_units, c.parameter_id FROM value_table v " \
            "JOIN cx_table c ON v.parameter_id = c.parameter_id " \
            "WHERE c.subsystem = '" + str(subsystem) + "' " \
            "LIMIT " + str(page_size) + " OFFSET " + str(page * page_size) + ";"
    
    results = VCC.Database.execute_raw_sql(query_str)
    rows = []
    if results:
        for r in results:
            rows.append({
            "description": r[0],
            "cur_state": r[1],
            "display_units": r[2],
            "parameter_id": r[3]
    })
        
    
    # Todo: Efficiently calculate total pages based on the number of rows and the page size (old method was slow)
    total_pages = 1 # Placeholder value

    return render_template(
        "table.html",
        rows=rows,
        subsystem=subsystem,
        page=page,
        total_pages=total_pages
    )




@app.route("/table_ids", methods=["GET", "POST"])
def table_ids():
    # Load parameter_ids from JSON file using your function
    data = ""#load_data()
    parameter_ids = data.get("parameter_ids", [])

    if not parameter_ids:
        return render_template("table.html", rows=[], page=0, total_pages=1, subsystem="")

    # Pagination parameters
    page = int(request.args.get("page", 0))
    page_size = int(request.args.get("size", 4))

    # Slice the list of IDs for the current page
    start = page * page_size
    end = start + page_size
    page_ids = parameter_ids[start:end]

    if not page_ids:
        return render_template("table.html", rows=[], page=page, total_pages=1, subsystem="")

    placeholders = ','.join(str(pid) for pid in page_ids)
    query_str = "SELECT c.description, v.cur_state, c.display_units, c.parameter_id " \
        "FROM value_table v " \
        "JOIN cx_table c ON v.parameter_id = c.parameter_id " \
        "WHERE c.parameter_id IN ("+str(placeholders)+");"

    results = VCC.Database.execute_raw_sql(query_str)

    rows = []
    if results:
        for r in results:
            rows.append({
                "description": r[0],
                "cur_state": r[1],
                "display_units": r[2],
                "parameter_id": r[3]
            })

    total_pages = 1

    return render_template(
    "table.html",
    rows=rows,
    page=page,
    total_pages=total_pages,
    subsystem=""  # or "Special View"
    )





@app.route("/alarm-test")
def alarm_test():

    str = "SELECT parameter_id, type FROM alarm_output_table;"
    results = VCC.Database.execute_raw_sql(str)

    #alarm_90101 = next((item for item in results if item[0] == 90101), None)

    status = 0
    if results:
        status = 1
        print("General Alarm:")
        print(status)
    else:
        print("Alarm with ID 90101 not found.")


    return render_template(
        "alarm-test.html",
        status = status
    )










def save_data(data):
    with open(PINNED_DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/add', methods=['POST'])
def add_parameter():
    param_id = request.json.get('parameter_id')
    data = load_data()
    if param_id not in data["parameter_ids"]:
        data["parameter_ids"].append(param_id)
        save_data(data)
    return jsonify(data)

@app.route('/remove', methods=['POST'])
def remove_parameter():
    param_id = request.json.get('parameter_id')
    data = load_data()
    if param_id in data["parameter_ids"]:
        data["parameter_ids"].remove(param_id)
        save_data(data)
    return jsonify(data)

@app.route('/get', methods=['GET'])
def get_data():
    return jsonify(load_data())









@app.route('/DAY_SCREEN', methods=['GET'])
def DAY_SCREEN():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(host="0.0.0.0", port = 8000, threaded=True, debug=True) #, use_reloader=False)
