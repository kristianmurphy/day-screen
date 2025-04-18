# App.py

import sys, os, csv, threading, time, math
sys.path.insert(2, '/home/s3svc/Desktop/Sobe_Sunset/Commissioning/Software/VCC/run')
sys.path.insert(3, '/home/s3svc/Desktop/Sobe_Sunset/Commissioning/Software/Classes')

from sobe_classes_vcc import vccClass
from vc_header import VCC_ID, config_file

from flask import Flask, request, render_template

app = Flask(__name__)



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

param_values = {}
pinned_params = {}

def fetch_column_names(table_name):
    query_str = "SELECT column_name FROM information_schema.columns WHERE table_name = '"+ table_name +"';"
    results = VCC.Database.execute_raw_sql(query_str)
    column_names = [col[0] for col in results]
    return column_names

def fetch_subsystems():
    query_str = f"SELECT DISTINCT subsystem FROM cx_table;"
    results = VCC.Database.execute_raw_sql(query_str)
    cols = [col[0] for col in results]
    subsystems = cols
    return subsystems


def fetch_param_values():
    global param_values
    #while True:
    query_str = f"SELECT v.* FROM value_table v JOIN cx_table c ON v.parameter_id = c.parameter_id WHERE c.subsystem = 'Air Handlers';"
    results = VCC.Database.execute_raw_sql(query_str)
    #column_names = [col[0] for col in results]
    param_values = results

#threading.Thread(target=fetch_param_values, daemon=True).start()
#fetch_param_values()
#param_values =fetch_column_names("value_table")
#query_str = f"SELECT COUNT(*) FROM cx_table;"
#results = VCC.Database.execute_raw_sql(query_str)
#param_values = results

@app.route("/table_partial")
def table_partial():
    page = int(request.args.get("page", 0))
    subsystem = request.args.get("subsystem", "")
    page_size=8

    query_str = "SELECT c.description, v.cur_state, c.display_units FROM value_table v " \
            "JOIN cx_table c ON v.parameter_id = c.parameter_id " \
            "WHERE c.subsystem = '" + str(subsystem) + "' " \
            "LIMIT " + str(page_size) + " OFFSET " + str(page * page_size) + ";"
    results = VCC.Database.execute_raw_sql(query_str)
    rows = []
    for r in results:
        rows.append({
        "description": r[0],
        "cur_state": r[1],
        "display_units": r[2],
    })
        
    # Query to get the total count of parameters for the given subsystem
    #count_query = " SELECT COUNT(*) " \
    #    "FROM value_table v " \
    #    "JOIN cx_table c ON v.parameter_id = c.parameter_id "\
    #    "WHERE c.subsystem = '" + str(subsystem)+ "' "
    #count_results = VCC.Database.execute_raw_sql(count_query)
    #total_rows = count_results[0][0] if count_results else 0
    
    # Calculate total pages based on the number of rows and the page size
    total_pages = 1 #(total_rows + page_size - 1) // page_size  # Using ceiling division

    return render_template(
        "table.html",
        rows=rows,
        subsystem=subsystem,
        page=page,
        total_pages=total_pages
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


@app.route('/DAY_SCREEN', methods=['GET'])
def DAY_SCREEN():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(host="0.0.0.0", port = 8000, threaded=True, debug=True) #, use_reloader=False)
