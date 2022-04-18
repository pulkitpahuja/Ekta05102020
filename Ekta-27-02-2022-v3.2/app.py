from flask import Flask, render_template, request, jsonify
import serial
import json
from webui import WebUI
import os
import time
import re
import csv
from xlsxwriter.workbook import Workbook
import struct
import datetime
from datetime import date, timedelta
from constants import BYTE_VAL

global start
timer_time = 0.5


def createFolder(directory):
    try:
        if not os.path.exists(directory):
            os.makedirs(directory)
    except OSError:
        print("Error: Creating directory. " + directory)


createFolder("static/data_storage/")
createFolder("static/output/")
createFolder("static/csv/")

ser = serial.Serial()

flag = {
    "kV": False,
    "mA": False,
    "Insulation": False,
    "ResistanceMeter": False,
    "VAW": False,
    "micro": False,
    "pF": False,
    "20V": False,
    "30A": False,
    "Frequency": False,
}

app = Flask(__name__)
ui = WebUI(app, debug=True)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0


@app.route("/")
@app.route("/<name>")
def hello(name=None):
    return render_template("main.html", name={"text": name})


def download_this_csv(result_data, name):
    result_data = json.loads(result_data)
    loc = (
        "static/csv/"
        + str(date.today())
        + "/single/"
        + str(result_data["device_id"])
        + "_"
        + str(result_data["datetime"])
    )
    createFolder("static/csv/" + str(date.today()) + "/single/")
    data_file = open(loc + "_data_file.csv", "w", encoding="utf-8")
    csv_writer = csv.writer(data_file)
    header = ["Name", "Result", "Unit", "Status"]
    csv_writer.writerow(header)

    temp_list = []

    del result_data["device_id"]
    del result_data["datetime"]

    for device in result_data.keys():
        temp_dict = {}
        temp_dict["Name"] = result_data[str(device)]["name"]
        temp_dict["Result"] = result_data[str(device)]["result"]
        temp_dict["Unit"] = result_data[str(device)]["param"]
        temp_dict["Status"] = result_data[str(device)]["status"]
        temp_list.append(temp_dict)

    for var in temp_list:

        csv_writer.writerow(var.values())

    data_file.close()

    return "Success - Location = " + loc + "_data_file.csv"


def compute_float(bytes_rec):
    data = []
    bytes_rec = list(bytes_rec)
    del bytes_rec[-1]
    del bytes_rec[-1]  ## deletes last 2 bytes (Checksum)
    del bytes_rec[:3]  ## deletes first 3 bytes (Header)
    for i in range(0, len(bytes_rec), 4):
        list1 = [bytes_rec[i + 1], bytes_rec[i], bytes_rec[i + 3], bytes_rec[i + 2]]
        final_val = list(struct.unpack("<f", bytearray(list1)))
        data.append(round(final_val[0], 2))

    if len(data) == 1:
        return data[0]
    else:
        return data


def checksum_func(arr):

    checksum = 0xFFFF
    for num in range(0, len(arr) - 2):
        lsb = arr[num]
        checksum = checksum ^ lsb
        for count in range(1, 9):
            lastbit = checksum & 0x0001
            checksum = checksum >> 1

            if lastbit == 1:
                checksum = checksum ^ 0xA001

    lowCRC = checksum >> 8
    checksum = checksum << 8
    highCRC = checksum >> 8

    return lowCRC & 0xFF == arr[-1] and highCRC & 0xFF == arr[-2]


def cal_checksum_func(bytes_rec):

    arr = bytes_rec[:]
    checksum = 0xFFFF
    for num in range(0, len(arr)):

        lsb = arr[num] % 256
        checksum = checksum ^ lsb
        for count in range(1, 9):
            lastbit = (checksum & 0x0001) % 256
            checksum = checksum >> 1

            if lastbit == 1:
                checksum = checksum ^ 0xA001

    lowCRC = (checksum >> 8) % 256
    checksum = checksum << 8
    highCRC = (checksum >> 8) % 256

    return lowCRC, highCRC


def run_and_get_data(secondMicro, truth, device, device_name, maximum, minimum, extra):
    BYTES_TO_SEND = BYTE_VAL[device_name]["arr"]
    RECV_LEN = BYTE_VAL[device_name]["RECV_LEN"]
    final_val = 0.0
    device = int(device)
    bytes_rec = bytearray([])
    ser.flushInput()
    ser.flushOutput()

    if maximum == "-":
        maximum = 100000

    if minimum == "-":
        minimum = -100000

    ##################################
    if device == 1:
        print("Programmer Relay - Device = 1")
        byte_to_write = bytearray([0x0C, 0x03, 160 + device, 000, 000, 0x04])
        low, high = cal_checksum_func(byte_to_write)
        byte_to_write.append(high)
        byte_to_write.append(low)
        ser.write(byte_to_write)
        ser.flush()
        time.sleep(timer_time)
    elif device >= 3 and device <= 6 and secondMicro == "false":
        print("Relay - Device = ", device)
        byte_to_write = bytearray([0x0C, 0x03, 160 + device - 1, 000, 000, 0x04])
        low, high = cal_checksum_func(byte_to_write)
        byte_to_write.append(high)
        byte_to_write.append(low)
        ser.write(byte_to_write)
        ser.flush()
        time.sleep(timer_time)
    elif device == 6 and secondMicro == "true":
        print("Relay - Device = ", device)
        byte_to_write = bytearray([0x0C, 0x03, 160 + device, 000, 000, 0x04])
        low, high = cal_checksum_func(byte_to_write)
        byte_to_write.append(high)
        byte_to_write.append(low)
        ser.write(byte_to_write)
        ser.flush()
        time.sleep(timer_time)
    elif device == 7 or device == 8:
        print("Relay - Device = ", device)

        byte_to_write = bytearray([0x0C, 0x03, 160 + device, 000, 000, 0x04])
        low, high = cal_checksum_func(byte_to_write)
        byte_to_write.append(high)
        byte_to_write.append(low)
        ser.write(byte_to_write)
        ser.flush()
        print(byte_to_write, len(byte_to_write))
        time.sleep(timer_time)
    elif device == 10:
        print("Relay - Device = ", device)
        byte_to_write = bytearray([0x0C, 0x03, 160 + device - 1, 000, 000, 0x04])
        low, high = cal_checksum_func(byte_to_write)
        byte_to_write.append(high)
        byte_to_write.append(low)
        ser.write(byte_to_write)
        ser.flush()
        time.sleep(timer_time)
    ##################################
    try:
        ser.write(BYTES_TO_SEND)
        ser.flush()
        bytes_rec = ser.read(RECV_LEN)
        if len(bytes_rec) < RECV_LEN:
            bytes_rec = bytearray([0] * RECV_LEN)

    except:
        bytes_rec = bytearray([0] * RECV_LEN)

    print("RECEIVED BYTES", re.findall("..", bytes_rec.hex()))

    if not checksum_func(bytes_rec):
        bytes_rec = bytearray([0] * RECV_LEN)

    computed_values = compute_float(bytes_rec)

    if device_name == "VAW":
        maximum = maximum.split(",")
        minimum = minimum.split(",")
        if computed_values[2] > float(maximum[2]) or computed_values[2] < float(
            minimum[2]
        ):
            if truth == "true" and not flag[device_name]:
                turn_on_device_relay(device_name)

    elif device_name == "kV":
        pass

    elif device_name == "ResistanceMeter":
        final_val = computed_values
        v_val = float(extra)
        if computed_values == 0:
            w_val = 0
        else:
            w_val = (v_val * v_val) / computed_values
        if w_val > float(maximum) or w_val < float(minimum):
            if truth == "true" and not flag[device_name]:
                turn_on_device_relay(device_name)

    else:
        final_val = computed_values
        if computed_values > float(maximum) or computed_values < float(minimum):
            if truth == "true" and not flag[device_name]:
                turn_on_device_relay(device_name)

    if device_name == "kV" or device_name == "VAW":
        temp_dict = {"vals": computed_values}
        return json.dumps(temp_dict)

    elif device_name == "Frequency":
        import random

        sam_Lst = [49.99, 50.01, 50.00, 50.02, 50.03]
        ran = random.choice(sam_Lst)
        return ran

    else:
        return final_val


def start_sequence():  ##turn 1st relay ON and 2nd relay OFF
    print("START SEQ")
    start = True
    to_write = bytearray([0x03, 0x03, 155, 000, 000, 0x04])
    low, high = cal_checksum_func(to_write)
    to_write.append(high)
    to_write.append(low)
    ser.write(to_write)
    time.sleep(timer_time)


def stop_sequence():
    time.sleep(timer_time)
    ##turn 1st relay OFF and 2nd relay ON
    to_write = bytearray([0x03, 0x03, 215, 000, 000, 0x04])
    low, high = cal_checksum_func(to_write)
    to_write.append(high)
    to_write.append(low)
    ser.write(to_write)
    flag = {
        "kV": False,
        "mA": False,
        "Insulation": False,
        "ResistanceMeter": False,
        "VAW": False,
        "micro": False,
        "pF": False,
        "20V": False,
        "30A": False,
        "Frequency": False,
    }
    global start
    start = False
    print("RELAY OFF", to_write)
    time.sleep(timer_time)
    ###########################
    to_write = bytearray([0x0C, 0x03, 170, 000, 000, 0x04])
    low, high = cal_checksum_func(to_write)
    to_write.append(high)
    to_write.append(low)
    ser.write(to_write)
    ser.flush()
    time.sleep(timer_time)


def run_serial(com):
    try:
        global ser
        ser.baudrate = 9600
        ser.port = "COM" + com
        ser.timeout = 0.7
        ser.parity = serial.PARITY_NONE
        ser.stopbits = serial.STOPBITS_ONE
        ser.bytesize = serial.EIGHTBITS
        ser.open()
        time.sleep(timer_time)
        return "true"
    except:
        try:
            ser.inWaiting()
            return "true"
        except:
            if ser:
                ser.close()
            return "false"


def turn_on_device_relay(device_name):
    to_write = bytearray([BYTE_VAL[device_name]["arr"][0], 0x03, 155, 000, 000, 0x04])
    low, high = cal_checksum_func(to_write)
    to_write.append(high)
    to_write.append(low)
    ser.write(to_write)
    flag[device_name] = True
    time.sleep(timer_time)


def turn_off_programmer_relay(device_name):
    to_write = bytearray([BYTE_VAL[device_name]["arr"][0], 0x03, 215, 000, 000, 0x04])
    low, high = cal_checksum_func(to_write)
    to_write.append(high)
    to_write.append(low)
    ser.write(to_write)
    print("RELAY OFF", to_write)
    flag[device_name] = False
    time.sleep(1)


def turn_off_device_relay(device_name):
    time.sleep(timer_time)
    to_write = bytearray([BYTE_VAL[device_name]["arr"][0], 0x03, 215, 000, 000, 0x04])
    low, high = cal_checksum_func(to_write)
    to_write.append(high)
    to_write.append(low)
    ser.write(to_write)
    print("RELAY OFF", to_write)
    flag[device_name] = False


def get_dates(start_date, end_date):
    sdate = datetime.datetime.strptime(start_date, "%Y-%m-%d")  # start date
    edate = datetime.datetime.strptime(end_date, "%Y-%m-%d")  # end date
    delta = edate - sdate  # as timedelta
    lst = []
    for i in range(delta.days + 1):
        day = sdate + timedelta(days=i)
        lst.append(day.strftime("%Y-%m-%d"))

    return lst


def overall_csv(data, name):
    print(data)
    x = datetime.datetime.now().strftime("%Y-%m-%d %H-%M-%S%p")
    loc = "static/csv/" + str(date.today()) + "/Overall/" + str(x)
    createFolder("static/csv/" + str(date.today()) + "/Overall/")
    workbook = Workbook(loc + "_data_file.xlsx")
    worksheet = workbook.add_worksheet()
    row_count = 0
    border = workbook.add_format()
    border.set_border(1)
    # csv_writer = csv.writer(data_file)
    top_row = ["Date : " + str(date.today()), " ", " ", " ", "Name : " + str(name)]
    for col_num, data_data in enumerate(top_row):
        worksheet.write(row_count, col_num, data_data)
    row_count += 1

    # csv_writer.writerow(top_row)
    header = ["Device"]
    for val in data[0].keys():
        try:
            header.append(data[0][str(val)]["name"] + "-" + data[0][str(val)]["param"])
        except:
            pass

    header.append("Timestamp")

    temp_list = []

    for obj in data:
        temp_dict = {}
        temp_dict[header[0]] = obj["device_id"]
        for val in obj.keys():
            if val == "device_id" or val == "timestamp":
                continue
            try:
                temp_dict[header[int(val)]] = (
                    str(obj[val]["result"]) + "-" + str(obj[val]["status"])
                )
            except:
                pass
        temp_dict[header[-1]] = obj["datetime"]
        temp_list.append(temp_dict)

    for col_num, data_data in enumerate(header):
        worksheet.write(row_count, col_num, data_data, border)
    row_count += 1

    green_bg = workbook.add_format({"font_color": "white"})
    green_bg.set_bg_color("green")
    red_bg = workbook.add_format({"font_color": "white"})
    red_bg.set_bg_color("red")
    green_bg.set_border(1)
    red_bg.set_border(1)
    for var in temp_list:
        # csv_writer.writerow(var.values())
        for col_num, data in enumerate(var.values()):
            if "Passed" in str(data):
                worksheet.write(row_count, col_num, data, green_bg)
            elif "Failed" in str(data):
                worksheet.write(row_count, col_num, data, red_bg)
            else:
                worksheet.write(row_count, col_num, data, border)
        row_count += 1

    workbook.close()
    path = "C:/Users"
    path = os.path.realpath("static/csv/" + str(date.today()) + "/Overall/")
    os.startfile(path)
    return "Success - Location = " + loc + "_data_file.xlsx"


@app.route("/csv_dated", methods=["GET", "POST", "DELETE"])
def csv_dated():
    if request.method == "POST":
        data = request.get_json(force=True)
        print(data)
        start_date = data["start_date"]
        end_date = data["end_date"]
        print(start_date, end_date)
        lst = get_dates(start_date, end_date)
        to_send = []
        for d in lst:
            try:
                files = os.listdir("./static/output/" + d + "/")
            except:
                return "Failure.Files For These Date Don't Exist"
            for file in files:
                with open("./static/output/" + d + "/" + file) as f:
                    json_data = json.load(f)
                    to_send.append(json_data)

        return overall_csv(to_send, data["org"])


@app.route("/sequence_init", methods=["GET", "POST", "DELETE"])
def sequence_init():
    if request.method == "POST":
        data = request.form.to_dict()
        global start

        if data["type"] == "start":
            start = True
            start_sequence()
        else:
            start = False
            stop_sequence()

        return "500"


@app.route("/turn_off_relay", methods=["GET", "POST", "DELETE"])
def turn_off_relay():  ## turn of individual device relay irrespective of state
    if request.method == "POST":
        data = request.form.to_dict()
        turn_off_device_relay(data["device_name"])
        return str(data["device_name"] + "Relay is now OFF")


@app.route("/save_curr_config", methods=["GET", "POST", "DELETE"])
def save_curr_config():
    if request.method == "POST":

        data = request.get_json(force=True)

        try:
            with open(
                "static/data_storage/" + data["device_id"] + ".json", "w"
            ) as outfile:
                json.dump(data, outfile)
            return "Success"
        except:
            return "Failure"


@app.route("/save_result", methods=["GET", "POST", "DELETE"])
def save_result():
    if request.method == "POST":
        global start
        start = False
        data = request.get_json(force=True)
        createFolder("static/output/" + str(date.today()))
        try:
            with open(
                "static/output/"
                + str(date.today())
                + "/"
                + data["device_id"]
                + " "
                + data["datetime"]
                + ".json",
                "w",
            ) as outfile:
                json.dump(data, outfile)
            return "Success"
        except:
            return "Failure"


@app.route("/load_data", methods=["GET", "POST", "DELETE"])
def load_data():
    return render_template("load_data.html")


@app.route("/load_config", methods=["GET", "POST", "DELETE"])
def load_config():
    if request.method == "POST":
        global start
        start = False
        data = request.form.to_dict()

        try:
            f = open(
                "static/data_storage/" + data["device_id"] + ".json",
            )
            data_ext = json.load(f)

            return jsonify(data_ext)
        except:
            return "No File Found"


@app.route("/connected", methods=["GET", "POST", "DELETE"])
def connected():
    global start
    start = False
    if request.method == "POST":
        data = request.form.to_dict()

        return run_serial(data["com_port"])


@app.route("/run_task", methods=["GET", "POST", "DELETE"])
def run_task():
    if request.method == "POST":
        data = request.form.to_dict()
        extra = 0
        try:
            extra = data["extra"]
            print(extra)
        except:
            extra = 0

        if data["secondMicro"] == "true":
            val = run_and_get_data(
                "true",
                data["truth"],
                data["device"],
                data["device_name"],
                data["maximum"],
                data["minimum"],
                extra,
            )
        else:
            val = run_and_get_data(
                "false",
                data["truth"],
                data["device"],
                data["device_name"],
                data["maximum"],
                data["minimum"],
                extra,
            )
        return str(val)


@app.route("/download_csv", methods=["GET", "POST", "DELETE"])
def download_csv():
    if request.method == "POST":
        data = request.get_json(force=True)
        return download_this_csv(data["data"], data["name"])


if __name__ == "__main__":
    ui.run()
