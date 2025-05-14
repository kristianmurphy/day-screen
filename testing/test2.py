
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


# currently active alarms 
str = f"SELECT * FROM cx_table WHERE description LIKE '%Alarm%' ORDER BY parameter_id;"
aotable = VCC.Database.execute_raw_sql(str)
for result in aotable:
    print(result)



#=============================#
# Debug functions

# Returns column names of the input table
def fetch_column_names(table_name):
    query_str = "SELECT column_name FROM information_schema.columns WHERE table_name = '"+ table_name +"';"
    results = VCC.Database.execute_raw_sql(query_str)
    column_names = [col[0] for col in results]
    return column_names

# Returns all unique values of 'subsystem' column from cx_table
def fetch_subsystems():
    query_str = f"SELECT DISTINCT subsystem FROM cx_table;"
    results = VCC.Database.execute_raw_sql(query_str)
    cols = [col[0] for col in results]
    subsystems = cols
    return subsystems

# Returns all rows/params from value table for the input subsystem
def fetch_param_values(subsystem):
    query_str = f"SELECT v.* FROM value_table v JOIN cx_table c ON v.parameter_id = c.parameter_id WHERE c.subsystem = '"+ subsystem +"';"
    results = VCC.Database.execute_raw_sql(query_str)
    return results

# Query to get the total count of parameters for the given subsystem
    #count_query = " SELECT COUNT(*) " \
    #    "FROM value_table v " \
    #    "JOIN cx_table c ON v.parameter_id = c.parameter_id "\
    #    "WHERE c.subsystem = '" + str(subsystem)+ "' "
    #count_results = VCC.Database.execute_raw_sql(count_query)
    #total_rows = count_results[0][0] if count_results else 0
