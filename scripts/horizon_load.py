import requests

def horizon_get(body):
    response = requests.get("https://ssd.jpl.nasa.gov/horizons_batch.cgi?batch=1&COMMAND='{}'&QUANTITIES='1,21'&CENTER='500@10'&START_TIME='1960-01-01'&STOP_TIME='2010-01-01'&STEP_SIZE='10d'&CSV_FORMAT='YES'".format(body))
    return response.text

if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser(description="Load data from NASA Horizon")
    parser.add_argument('-b', '--body', required=True, help="Horizon body ID")
    parser.add_argument('-o', '--out', required=True, help="Output file")

    args = parser.parse_args()

    data = horizon_get(args.body)
    segments = data.split('***************************************************************************')
    try:
        location_data = segments[8][7:-7]
    except:
        print(data)
    info = segments[1][5:]

    with open(args.out + ".horizon", 'w') as f:
        f.write(location_data)

    with open(args.out + ".info.horizon", 'w') as f:
        f.write(info)
