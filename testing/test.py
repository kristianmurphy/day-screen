
import sys, os, csv
sys.path.insert(2, '/home/s3svc/Desktop/Sobe_Sunset/Commissioning/Software/VCC/run')
sys.path.insert(3, '/home/s3svc/Desktop/Sobe_Sunset/Commissioning/Software/Classes')

from sobe_classes_vcc import vccClass
from vc_header import VCC_ID, config_file



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

# main table with the description of all parameters
query_str = f"SELECT * FROM cx_table ORDER BY parameter_id;"
results = VCC.Database.execute_raw_sql(query_str)

#for result in results:
#    print(result)

#  table with the current values of all parameters
query_str = f"SELECT * FROM value_table ORDER BY parameter_id;"
results = VCC.Database.execute_raw_sql(query_str)

for result in results:
    print(result)

#  table mapping integer codes to display code
query_str = f"SELECT * FROM display_map_table ORDER BY parameter_id;"
results = VCC.Database.execute_raw_sql(query_str)

#for result in results:
#    print(result)

# shows all devices and their ping statuses
sql_str_node = 'SELECT * FROM parameter_table ORDER BY node_id ASC;'
results = VCC.Database.execute_raw_sql(sql_str_node)

#print(results)


# currently active alarms 
str = "SELECT parameter_id, type FROM alarm_output_table;"
aotable = VCC.Database.execute_raw_sql(str)

alarm_90101 = next((item for item in results if item[0] == 90101), None)


if alarm_90101:
    value = alarm_90101[3]
    print("General Alarm:")
    print(value)
else:
    print("Alarm with ID 90101 not found.")
