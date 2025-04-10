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
query_str = f"SELECT COUNT(*) FROM cx_table;"
results = VCC.Database.execute_raw_sql(query_str)
param_values = results

@app.route('/DAY_SCREEN', methods=['GET'])
def DAY_SCREEN():
    page_size = 20  # number of items per page
    page = int(request.args.get('page', 0))  # page number starts at 0
    subsystem = request.args.get('subsystem', 'Air Handlers')  # default subsystem

    offset = page * page_size

    query = """
        SELECT c.parameter_id, c.value, c.subsystem, c.display_units
        FROM cx_table c
        JOIN description_table p ON c.parameter_id = p.parameter_id
        WHERE c.subsystem = {subsystem}
        ORDER BY c.parameter_id
        LIMIT {page_size} OFFSET {offset};
    """
    results = VCC.Database.execute_raw_sql(query_str)

    # Calculate the total number of pages based on the results
    total_pages = math.ceil(len(results) / page_size) if results else 1

    return render_template(
        'index.html',
        page=page,
        rows=results,
        total_pages=total_pages,
        subsystem=subsystem
    )


@app.route('/DAY_SCREEN_test', methods=['GET', 'POST'])
def CX_UI(): 
    return render_template('index.html',
                           sys_status='OK',
                           in_control="HELM",
                           wind="ENE 8kt (12kt)",
                           air_status="Cooling",
                           air_set=str(75),
                           air_temp=str(75),
                           battery_1=str(85),
                           battery_2=str(86),
                           fuel_tank=str(92),
                           freshwater_tank=str(81),
                           greywater_tank=str(10),
                           blackwater_tank=(4))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port = 8000, threaded=True, debug=True) #, use_reloader=False)
