import model, tsp, time, json
import csv
from urllib2 import Request, urlopen
import credentials

def load_directions(session):

    api_key = credentials.API_KEY_2
    url = 'https://maps.googleapis.com/maps/api/directions/json?'
    nodes = model.session.query(model.City).all()
    for i in range(59, 60):
        city1 = nodes[i].city
        state1 = nodes[i].state
        city1_escaped = (city1 + "," + state1).replace(" ", "%20")
        city1_underscore = city1.replace (" ", "_")
        for j in range(66):
            city2 = nodes[j].city
            state2 = nodes[j].state
            city2_escaped = (city2 + "," + state2).replace(" ", "%20")
            city2_underscore = city2.replace(" ", "_")
            filename = "directions2/"+city1_underscore+'-'+city2_underscore+".json"
            print filename
            parameters = 'origin='+city1_escaped+'&destination='+city2_escaped+'&key='
            request = Request(url + parameters + api_key)
            print url + parameters + api_key
            response = urlopen(request)
            results = response.read() #This gives me back JSON with directions
            print "results"
            f = open(filename, 'w')
            f.write(results)
            print "wrote file"
            f.close()
            time.sleep(1) #so google doesn't get upset

def read_directions_files(session):

    nodes = model.session.query(model.City).all()
    #distance = model.session.query(model.Distance).all()
    #loop through the cities in nodes and extract the city name to grab the file
    for i in range(len(nodes)):
        city1 = nodes[i].city
        for j in range(len(nodes)):
            city2 = nodes[j].city
            #print(i,j)
            if city1 == city2:
                #print "Hello"
                continue
            #parse into filename
            city1_underscore = city1.replace (" ", "_")
            city2_underscore = city2.replace (" ", "_")
            filename = "directions2/"+city1_underscore+'-'+city2_underscore+".json"
            print filename
            f = open(filename)
            jsondata = f.read()
            data = json.loads(jsondata)
            #distance in miles. Now what do I do with it?
            leg_miles = data["routes"][0]["legs"][0]["distance"]["value"] * 0.000621371
            leg_polyline = data["routes"][0]["overview_polyline"]["points"]
            distance = model.Distance( city1_id = nodes[i].id, city2_id = nodes[j].id, 
                road_miles = leg_miles, polyline = leg_polyline)
            session.add(distance)
    session.commit()



def load_cities(session):

    with open('big_cities.csv', 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter = ",")
        for row in reader:
            city = model.City(city=row[1], state=row[0], lat=row[2], longitude=row[3], capital=row[4])
            session.add(city)
    session.commit()

# def load_distance(session):
#     """loop through all the cities in the cities table and calculate the distance
#     between them and insert into the matrix.
#     """
#     nodes = model.session.query(model.City).all()
#     for i in range(len(nodes)):
#         for j in range(i+1, len(nodes)):
#             dist = tsp.distance_between_two_cities(nodes[i].lat, nodes[i].longitude,
#              nodes[j].lat, nodes[j].longitude)
#             # dist_object = model.Distance.query.filter_by(model.Distance.city1_id=i, model.Distance.city2_id=j).one()
#             dist_object = model.session.query(model.Distance).filter_by(city1_id=i,city2_id=j).first()
#             if dist_object:
#                 print "i is", i
#                 print "j is", j
#                 dist_object.miles = dist
#                 print dist_object.miles
#                 session.add(dist_object)
#     session.commit()
#     session.close()

def main(session):

    #read_directions_files(session)
    load_directions(session)
    #load_distance(session)
    #load_cities(session)


if __name__ == "__main__":
    s= model.connect()
    main(s)


