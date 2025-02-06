import json
from app import app
from flask import jsonify, request, render_template
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/process-inflybo', methods=['POST'])
def process_inflybo_excel():
    data = request.json
    rows = data.get('data', '').strip().split('\n')
    
    is_excel = '\t' in rows[1] if len(rows) > 1 else False
    
    if is_excel:
        return process_excel_format(rows[1:])
    else:
        return process_inflybo_format(rows)

def process_excel_format(rows):
    processed_data = []
    current_cus = None
    guest_count = 0
    
    for row in reversed(rows):
        if not row.strip():
            continue
            
        cols = row.strip().split('\t')
        if len(cols) < 11:
            continue
            
        num, name, ticket_class, access, pax_type, airline, seat, flight, entry, departure, arrival = cols[:11]
        
        try:
            entry_date = datetime.strptime(entry, '%B %d, %Y %I:%M %p')
            formatted_entry = {
                'year': entry_date.year,
                'day': entry_date.strftime('%Y-%m-%d'),
                'time': entry_date.strftime('%H:%M:%S'),
                'exit_time': (entry_date + timedelta(hours=4)).strftime('%H:%M:%S')
            }
        except Exception as e:
            formatted_entry = {'year': '', 'day': '', 'time': '', 'exit_time': ''}

        if pax_type.strip().upper() == 'CUS':
            if current_cus:
                current_cus['guests'] = guest_count
                processed_data.append(current_cus)
            current_cus = {
                'name': name.strip(),
                'access': access.strip(),
                'airline_flight': f"{airline.strip().upper()}{flight.strip()}",
                'entry': formatted_entry,
                'guests': 0
            }
            guest_count = 0
        elif pax_type.strip().upper() == 'GST':
            guest_count += 1
    
    if current_cus:
        current_cus['guests'] = guest_count
        processed_data.append(current_cus)
    
    return jsonify(list(reversed(processed_data)))

def process_inflybo_format(rows):
    processed_data = []
    current_cus = None
    guest_count = 0
    
    rows = [row for row in rows if not row.startswith('**')]
    
    for row in reversed(rows):
        try:
            parts = row.split(' AM') if ' AM' in row else row.split(' PM')
            entry_time = (parts[0].split('February')[1] + (' AM' if ' AM' in row else ' PM')).strip()
            entry_full = 'February' + entry_time
            
            data_part = parts[0].split('February')[0]
            
            num = data_part[0]
            flight = data_part[-4:]
            
            pax_index = data_part.find('CUS') if 'CUS' in data_part else data_part.find('GST')
            pax_type = 'CUS' if 'CUS' in data_part else 'GST'
            
            airline = data_part[-6:-4]
            
            name_end = data_part.find('Priority Pass') if 'Priority Pass' in data_part else data_part.find('Lounge Key')
            if name_end == -1:
                name_end = data_part.find('Business SkyTeam')
            name = data_part[1:name_end].strip()
            
            access = ''
            if 'Priority Pass' in data_part:
                access = 'Priority Pass'
            elif 'Lounge Key' in data_part:
                access = 'Lounge Key'
            elif 'Business SkyTeam' in data_part:
                access = 'Business SkyTeam'

            try:
                entry_date = datetime.strptime(entry_full, '%B %d, %Y %I:%M %p')
                formatted_entry = {
                    'year': entry_date.year,
                    'day': entry_date.strftime('%Y-%m-%d'),
                    'time': entry_date.strftime('%H:%M:%S'),
                    'exit_time': (entry_date + timedelta(hours=4)).strftime('%H:%M:%S')
                }
            except:
                formatted_entry = {'year': '', 'day': '', 'time': '', 'exit_time': ''}

            if pax_type == 'CUS':
                if current_cus:
                    current_cus['guests'] = guest_count
                    processed_data.append(current_cus)
                current_cus = {
                    'name': name,
                    'access': access,
                    'airline_flight': f"{airline.strip().upper()}{flight.strip()}",
                    'entry': formatted_entry,
                    'guests': 0
                }
                guest_count = 0
            elif pax_type == 'GST':
                guest_count += 1

        except Exception as e:
            print(f"Error processing row: {row}")
            print(f"Error: {str(e)}")
            continue
    
    if current_cus:
        current_cus['guests'] = guest_count
        processed_data.append(current_cus)
    
    return jsonify(list(reversed(processed_data)))

@app.route('/api/flight-time/<flight_code>')
def get_flight_time(flight_code):
   airline = flight_code[:2]
   flight_num = str(int(flight_code[2:]))
   search_code = f"{airline} {flight_num}"
   
   url = "https://www.nuevopudahuel.cl/sites/all/themes/vinci_airport/request/home/request_vuelos_home.php"
   
   print(f"Current time: {datetime.now().strftime('%H:%M')}")
   print(f"Searching for flight: {search_code}")

   # Try direct search first
   direct_search_payloads = [
       {
           "action": "get_vuelos_nuevo_home",
           "coincidencia": search_code.replace(" ", ""),  # Try without space
           "salida_llegada": "0",
           "nac_inter": "0",
           "horario": "0",
           "rango": "0",
           "idioma": "es",
           "page": "1"
       },
       {
           "action": "get_vuelos_nuevo_home",
           "coincidencia": search_code,  # Try with space
           "salida_llegada": "0",
           "nac_inter": "0",
           "horario": "0",
           "rango": "0",
           "idioma": "es",
           "page": "1"
       }
   ]

   # Try direct search first
   print("\nTrying direct search:")
   for payload in direct_search_payloads:
       try:
           response = requests.post(url, json=payload)
           print(f"Trying payload: {payload}")
           data = json.loads(json.loads(response.text))
           
           if 'message' in data:
               for flight in data['message']:
                   flight_id = flight.get('npg_iata_airline', '').strip()
                   flight_time = flight.get('hora', 'N/A')
                   flight_status = flight.get('observacion', '')
                   print(f"Found flight: {flight_id} at {flight_time} - Status: {flight_status}")
                   
                   if flight_id == search_code:
                       return jsonify({
                           "time": flight_time,
                           "status": flight_status if flight_status else ""
                       })
                   
       except Exception as e:
           print(f"Error with direct search: {str(e)}")
           continue

   # If direct search fails, try the regular search
   periods = ['am', 'pm']
   ranges = ['1', '2', '3', '4', '5', '6', '7']
   
   for period in periods:
       for rango in ranges:
           payload = {
               "action": "get_vuelos_nuevo_home",
               "coincidencia": "0",
               "salida_llegada": "Departure",
               "nac_inter": "International",
               "horario": period,
               "rango": rango,
               "idioma": "es",
               "page": "1"
           }
           
           try:
               response = requests.post(url, json=payload)
               data = json.loads(json.loads(response.text))
               
               print(f"\nChecking {period}, range {rango}:")
               for flight in data['message']:
                   flight_id = flight.get('npg_iata_airline', '').strip()
                   flight_time = flight.get('hora', 'N/A')
                   flight_status = flight.get('observacion', '')
                   print(f"Found flight: {flight_id} at {flight_time} - Status: {flight_status}")
                   
                   if flight_id == search_code:
                       return jsonify({
                           "time": flight_time,
                           "status": flight_status if flight_status else ""
                       })
                   
           except Exception as e:
               continue

   return jsonify({"time": "SALIDO", "status": ""})