# App.py

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
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
    app.run(debug=True)
