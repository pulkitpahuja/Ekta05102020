alert("Before Starting Please ensure Serial device is connected");
var overall_device = 1;
var count = 0; //keeps track of the time elapsed
var task_interval; //Run order timer (the order in which the devices are run)
var timer; //Run the timer for seconds(time)
var start_counter = 0; // this counter is used to keep track of the order of the devices (index of order array)
var inner_counter = 0; // inner counter is there for access the type of order with multiple device (index of inner array)
var status;
var hasReturned = "false";

for (var i = 1; i <= 12; i++) {
  if (i == 1 || i == 12) {
  } else {
    if (!document.getElementById("max_" + i).disabled)
      document.getElementById("max_" + i).value = 0;
    if (!document.getElementById("min_" + i).disabled)
      document.getElementById("min_" + i).value = 0;
  }

  if (document.getElementById("time_" + i).disabled) {
    document.getElementById("time_" + i).value = "";
  } else {
    document.getElementById("time_" + i).value = 0;
  }
}

document.getElementById("max_resistance").value = 0;
document.getElementById("delay").value = 1;

document.getElementById("max_13").value = 0;
document.getElementById("min_13").value = 0;

document.getElementById("name_1").value = "kV";
document.getElementById("name_2").value = "mA";
document.getElementById("name_3").value = "Insulation";
document.getElementById("name_4").value = "Resistance Meter";
// document.getElementById("name_5").value = "VAW";
// document.getElementById("name_9").value = "PF";
document.getElementById("name_8").value = "MicroAmpere";
document.getElementById("name_10").value = "20V";
document.getElementById("name_11").value = "30A";
document.getElementById("name_12").value = "Frequency";
document.getElementById("name_resistance").value = "Resistance";

document.getElementById("param_1").value = "kV";
document.getElementById("param_2").value = "mA";
document.getElementById("param_3").value = "MΩ";
document.getElementById("param_4").value = "Ω";
// document.getElementById("param_5").value = "V";
// document.getElementById("param_6").value = "A";
// document.getElementById("param_7").value = "W";
document.getElementById("param_8").value = "μA-1";
document.getElementById("param_13").value = "μA-2";
// document.getElementById("param_9").value = "";
document.getElementById("param_10").value = "V";
document.getElementById("param_11").value = "A";
document.getElementById("param_12").value = "Hz";
document.getElementById("param_resistance").value = "Ω";

document.getElementById("datetime").innerHTML =
  Date.today().toString("MMMM d yyyy") + " " + new Date().toString("HH:mm:ss");

const processKV = (truth) => {
  console.log("processKV");
  const to_send = {
    secondMicro: false,
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 1,
    device_name: "kV",
    maximum: -10000,
    minimum: 10000,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      list = Object.values(JSON.parse(response))[0];
      document.getElementById("result_1").value =
        list[1] == 2 ? list[0] + "-Failed" : list[0] + "-Passed";
      if (list[1] == 2) {
        stop();
        $("#result_1").css({ color: "red" });
      } else {
        $("#result_1").css({ color: "green" });
      }
    },
  });
};

const processmA = (truth) => {
  console.log("processmA");
  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 2,
    device_name: "mA",
    maximum: document.getElementById("max_2").value,
    minimum: document.getElementById("min_2").value,
  };

  $.ajax({
    type: "POST",

    url: "/run_task",
    cache: false,
    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById("result_2").value = response;
      if (
        parseFloat(response) <= parseFloat(to_send["maximum"]) &&
        parseFloat(response) >= parseFloat(to_send["minimum"])
      ) {
        $("#result_2").css({ color: "green" });
      } else {
        $("#result_2").css({ color: "red" });
      }
    },
  });
};

const processInsulation = (truth) => {
  console.log("processInsulation");
  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 3,
    device_name: "Insulation",
    maximum: document.getElementById("max_3").value,
    minimum: document.getElementById("min_3").value,
  };

  $.ajax({
    type: "POST",

    url: "/run_task",
    cache: false,
    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById("result_3").value = response;

      if (
        parseFloat(response) <= parseFloat(to_send["maximum"]) &&
        parseFloat(response) >= parseFloat(to_send["minimum"])
      ) {
        $("#result_3").css({ color: "green" });
      } else {
        setTimeout(function () {
          stop();
        }, 2500);
        $("#result_3").css({ color: "red" });
      }
    },
  });
};

const processResistanceMeter = (truth) => {
  console.log("processResistanceMeter");
  const valV = parseFloat(document.getElementById("value_V_input").value);
  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 4,
    extra: valV,
    device_name: "ResistanceMeter",
    maximum: document.getElementById("max_4").value,
    minimum: document.getElementById("min_4").value,
  };

  // Max Min on W

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById("result_4").value = response;
      let valW, valI;
      if (parseFloat(response) == 0) {
        valW = 0;
        valI = 0;
      } else {
        valW = (valV * valV) / parseFloat(response);
        valI = valV / parseFloat(response);
      }
      document.getElementById("result_valW").value = valW.toFixed(2);
      document.getElementById("result_valI").value = valI.toFixed(2);
      if (
        parseFloat(valW) <= parseFloat(to_send["maximum"]) &&
        parseFloat(valW) >= parseFloat(to_send["minimum"])
      ) {
        $("#result_valW").css({ color: "green" });
      } else {
        $("#result_valW").css({ color: "red" });
      }
    },
  });
};

const processVAW = (truth) => {
  console.log("processVAW");
  var to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 5,
    device_name: "VAW",
    maximum: [
      document.getElementById("max_5").value,
      document.getElementById("max_6").value,
      document.getElementById("max_7").value,
    ].toString(),
    minimum: [
      document.getElementById("min_5").value,
      document.getElementById("min_6").value,
      document.getElementById("min_7").value,
    ].toString(),
  };

  $.ajax({
    type: "POST",

    url: "/run_task",
    cache: false,
    data: to_send, // serializes the form's elements.
    success: function (response) {
      list = Object.values(JSON.parse(response))[0];
      for (var i = 0; i < list.length; i++) {
        var val = 5 + i;
        var max = document.getElementById("max_" + val).value;
        var min = document.getElementById("min_" + val).value;
        document.getElementById("result_" + val).value = list[i];
        if (list[i] <= parseFloat(max) && list[i] >= parseFloat(min)) {
          $("#result_" + val).css({ color: "green" });
        } else {
          $("#result_" + val).css({ color: "red" });
        }
      }
    },
  });
};

const processPF = (truth) => {
  console.log("processPF");
  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 7,
    device_name: "pF",
    maximum: document.getElementById("max_9").value,
    minimum: document.getElementById("min_9").value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById("result_9").value = Math.abs(response);

      if (
        parseFloat(response) <= parseFloat(to_send["maximum"]) &&
        parseFloat(response) >= parseFloat(to_send["minimum"])
      ) {
        $("#result_9").css({ color: "green" });
      } else {
        $("#result_9").css({ color: "red" });
      }
    },
  });
};

const processMicroAmp1 = (truth) => {
  console.log("processMicroAmp1");
  let identifier = 8;

  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 6,
    device_name: "micro",
    maximum: document.getElementById(`max_${identifier}`).value,
    minimum: document.getElementById(`min_${identifier}`).value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`result_${identifier}`).value = response;

      if (
        parseFloat(response) <= parseFloat(to_send["maximum"]) &&
        parseFloat(response) >= parseFloat(to_send["minimum"])
      ) {
        $(`#result_${identifier}`).css({ color: "green" });
      } else {
        $(`#result_${identifier}`).css({ color: "red" });
      }
    },
  });
};

const processMicroAmp2 = (truth) => {
  console.log("processMicroAmp2");
  let identifier = 13;

  const to_send = {
    secondMicro: "true",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 6,
    device_name: "micro",

    maximum: document.getElementById(`max_${identifier}`).value,
    minimum: document.getElementById(`min_${identifier}`).value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`result_${identifier}`).value = response;

      if (
        parseFloat(response) <= parseFloat(to_send["maximum"]) &&
        parseFloat(response) >= parseFloat(to_send["minimum"])
      ) {
        $(`#result_${identifier}`).css({ color: "green" });
      } else {
        $(`#result_${identifier}`).css({ color: "red" });
      }
    },
  });
};

const process20V = (truth) => {
  console.log("process20V");
  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 8,
    device_name: "20V",
    maximum: 100000,
    minimum: document.getElementById("min_10").value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`result_10`).value = response;

      if (parseFloat(response) >= parseFloat(to_send["minimum"])) {
        $("#result_10").css({ color: "green" });
      } else {
        $("#result_10").css({ color: "red" });
      }
    },
  });
};

const process30A = (truth) => {
  console.log("process30A");
  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 9,
    device_name: "30A",
    maximum: 100000,
    minimum: document.getElementById("min_11").value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`result_11`).value = response;

      if (parseFloat(response) >= parseFloat(to_send["minimum"])) {
        $("#result_11").css({ color: "green" });
      } else {
        $("#result_11").css({ color: "red" });
      }
      processResistance();
    },
  });
};

const processResistance = () => {
  console.log("processResistance");
  const twentyvolt = document.getElementById("result_10").value;
  const twentyvoltmin = document.getElementById("min_10").value;
  const thirtyamp = document.getElementById("result_11").value;
  const resis = (twentyvolt - twentyvoltmin) / thirtyamp;
  document.getElementById("result_resistance").value = resis;
  if (resis > document.getElementById("min_resistance").value) {
    $("#result_resistance").css({ color: "green" });
  } else {
    $("#result_resistance").css({ color: "red" });
  }
};

const processFrequency = (truth) => {
  console.log("processFrequency");
  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 10,
    device_name: "Frequency",
    maximum: -100000,
    minimum: 1000000,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`result_12`).value = response;
      $("#result_12").css({ color: "green" });
    },
  });
};

const order = [
  {
    work: ["kV", "mA"],
    time: 1,
  },
  {
    work: ["Insulation"],
    time: 3,
  },
  {
    work: ["ResistanceMeter"],
    time: 4,
  },
  { work: ["MicroAmpere1"], time: 8 },
  { work: ["MicroAmpere2"], time: 8 },
  { work: ["20V", "30A"], time: 10 },
  {
    work: ["Frequency"],
    time: 12,
  },
];

const start_test = () => {
  task_interval = setInterval(function () {
    count++;
    console.log("Count: " + count);
  }, 2000);

  timer = setInterval(() => {
    const or = order[start_counter];
    const work_length = or.work.length;
    const del = parseInt(document.getElementById("delay").value) || 1;
    const time =
      parseInt(document.getElementById(`time_${or.time}`).value) || 0;
    if (count <= del) {
      console.log("Running Delayed function: ", or.work[inner_counter]);
      MAIN[or.work[inner_counter]]("false");
      if (inner_counter === work_length - 1) {
        inner_counter = 0;
      } else {
        inner_counter++;
      }
    }
    if (count > del && count <= time) {
      console.log("Running Normal function: ", or.work[inner_counter]);
      MAIN[or.work[inner_counter]]("true");
      if (inner_counter === work_length - 1) {
        inner_counter = 0;
      } else {
        inner_counter++;
      }
    }
    if (count > time) {
      //test swtiching
      or.work.forEach((dev, idx) => {
        setTimeout(() => {
          if (dev.startsWith("MicroAmpere1")) {
            turn_off_device_relay("micro");
          } else if (dev.startsWith("MicroAmpere2")) {
          } else {
            turn_off_device_relay(dev);
          }
        }, 1000 * idx);
      });
      inner_counter = 0;
      start_counter++;
      count = 0;
    }
    if (start_counter >= order.length) {
      //end of test
      stop();
      save_result_data();
    }
  }, 2200);
};

const MAIN = {
  kV: processKV,
  mA: processmA,
  Resistance: processResistance,
  MicroAmpere1: processMicroAmp1,
  MicroAmpere2: processMicroAmp2,
  ResistanceMeter: processResistanceMeter,
  VAW: processVAW,
  pF: processPF,
  "20V": process20V,
  "30A": process30A,
  Frequency: processFrequency,
  Insulation: processInsulation,
};

function reset() {
  for (var i = 1; i <= 13; i++) {
    document.getElementById("result_" + i).value = "";
  }
  document.getElementById("result_resistance").value = "";
  document.getElementById("strt_butt").innerHTML = "Start";
  document.getElementById("result_valW").value = "";
  document.getElementById("result_valI").value = "";
  document.getElementById("device_id").value = "";
  clearInterval(timer);
  clearInterval(task_interval);
  start_counter = 0;
  count = 0;
  inner_counter = 0;
  overall_device = 1;
}

function turn_off_device_relay(device_name) {
  //turn off individual device relay
  $.ajax({
    type: "POST",
    url: "/turn_off_relay",
    data: {
      device_name: device_name,
      com_port: document.getElementById("com_port").value,
    }, // serializes the form's elements.
    success: function (data) {
      console.log("Relay Status : " + data);
    },
  });
}

function stop() {
  stop_sequence();
  turn_off_device_relay(overall_device);
  clearInterval(timer);
  clearInterval(task_interval);
  start_counter = 0;
  count = 0;
  inner_counter = 0;
  overall_device = 1;
}

function start() {
  if (document.getElementById("device_id").value == "") {
    alert("Enter Device ID");
    return;
  }
  if (document.getElementById("ser_status").innerHTML == "Disconnected") {
    alert("Serial Connection Not Found");
    load_config();
    return;
  }
  console.log("STarting TASK");
  start_sequence();
  start_test();
}

function start_sequence() {
  //##turning relay on or off
  $.ajax({
    type: "POST",
    url: "/sequence_init",
    data: {
      type: "start",
      com_port: document.getElementById("com_port").value,
    }, // serializes the form's elements.
    success: function (data) {
      console.log("Result Status : " + data);
    },
  });
}

function stop_sequence() {
  //##turning relay on or off

  $.ajax({
    type: "POST",
    url: "/sequence_init",
    data: { type: "stop", com_port: document.getElementById("com_port").value }, // serializes the form's elements.
    success: function (data) {
      console.log("Result Status : " + data);
    },
  });
}

function stop_task() {
  clearInterval(task_interval);
  clearInterval(timer);
}

function save_result_data() {
  var curr_config = {};
  curr_config["device_id"] = document.getElementById("device_id").value;
  var result_col = document.getElementById("result_col");
  var resultElements = result_col.querySelectorAll("input");
  var name_col = document.getElementById("name_col");
  var nameElements = name_col.querySelectorAll("input");
  var param_col = document.getElementById("param_col");
  var paramElements = param_col.querySelectorAll("input");
  let name_element = "";
  resultElements.forEach((element, idx) => {
    var temp_config = {};
    if (nameElements[idx].value) {
      name_element = nameElements[idx].value;
    }
    temp_config["name"] = name_element;
    temp_config["param"] = paramElements[idx].value || "";
    temp_config["result"] = element.value;
    if (element.style.color == "red") {
      temp_config["status"] = "Failed";
    } else {
      temp_config["status"] = "Passed";
    }
    curr_config[(idx + 1).toString()] = temp_config;
  });
  curr_config["datetime"] =
    Date.today().toString("dd-MM-yyyy") + " " + new Date().toString("HH_mm_ss");

  $.ajax({
    type: "POST",
    url: "/save_result",
    data: JSON.stringify(curr_config), // serializes the form's elements.
    success: function (data) {
      alert("Result Status : " + data);
    },
  });

  $.ajax({
    type: "POST",
    url: "/download_csv",
    data: JSON.stringify({ name: "", data: JSON.stringify(curr_config) }), // serializes the form's elements.
    success: (data) => {
      alert(data);
    },
  });
}

function save_curr_config() {
  var curr_config = {};
  $(document).ready(function () {
    curr_config["device_id"] = document.getElementById("config_id").value;
    curr_config["delay"] = document.getElementById("delay").value;
    curr_config["com_port"] = document.getElementById("com_port").value;
    for (var i = 1; i <= 14; i++) {
      var temp_config = {};
      if (i > 5 && i < 8) {
        temp_config["name"] = document.getElementById("name_5").value;
        temp_config["max"] = document.getElementById("max_" + i).value;
        temp_config["min"] = document.getElementById("min_" + i).value;
        temp_config["param"] = document.getElementById("param_" + i).value;
        curr_config[i.toString()] = temp_config;
      } else if (i == 13) {
        temp_config["name"] = document.getElementById("name_8").value;
        temp_config["time"] = document.getElementById("time_8").value;
        temp_config["max"] = document.getElementById("max_13").value;
        temp_config["min"] = document.getElementById("min_13").value;
        temp_config["param"] = document.getElementById("param_13").value;
        curr_config[i.toString()] = temp_config;
      } else if (i == 14) {
        temp_config["name"] = document.getElementById("name_resistance").value;
        temp_config["max"] = document.getElementById("max_resistance").value;
        //temp_config["min"] = document.getElementById("min_resistance").value;
        temp_config["param"] =
          document.getElementById("param_resistance").value;
        curr_config[i.toString()] = temp_config;
      } else {
        if (i == 4) {
          temp_config["value_V_input"] =
            document.getElementById("value_V_input").value;
        }
        temp_config["name"] = document.getElementById("name_" + i).value;
        temp_config["time"] = document.getElementById("time_" + i).value;
        temp_config["max"] = document.getElementById("max_" + i).value;
        temp_config["min"] = document.getElementById("min_" + i).value;
        temp_config["param"] = document.getElementById("param_" + i).value;
        curr_config[i.toString()] = temp_config;
      }
    }

    console.log(curr_config);

    $.ajax({
      type: "POST",
      url: "/save_curr_config",
      data: JSON.stringify(curr_config), // serializes the form's elements.
      success: function (data) {
        alert("Save Status : " + data);
      },
    });
  });
}

function get_connect_status() {
  $.ajax({
    type: "POST",
    url: "/connected",
    data: { com_port: document.getElementById("com_port").value }, // serializes the form's elements.
    success: function (data) {
      if (data == "true") {
        document.getElementById("ser_status").innerHTML = "Connected";
        $("#ser_status").css({ color: "green" });
      } else {
        document.getElementById("ser_status").innerHTML = "Disconnected";
        $("#ser_status").css({ color: "red" });
      }
    },
  });
}

function load_config() {
  $.ajax({
    type: "POST",
    url: "/load_config",
    data: { device_id: document.getElementById("config_id").value }, // serializes the form's elements.
    success: function (data) {
      if (typeof data == "string") {
        alert("Load Status: " + data);
      } else {
        for (var i = 1; i <= 14; i++) {
          if (i > 5 && i < 8) {
            if (!document.getElementById("max_" + i).disabled)
              document.getElementById("max_" + i).value = data[i]["max"];
            if (!document.getElementById("min_" + i).disabled)
              document.getElementById("min_" + i).value = data[i]["min"];
            document.getElementById("param_" + i).value = data[i]["param"];
          } else if (i == 13) {
            document.getElementById("time_8").value = data[i]["time"];
            document.getElementById("max_13").value = data[i]["max"];
            document.getElementById("min_13").value = data[i]["min"];
            document.getElementById("param_13").value = data[i]["param"];
            document.getElementById("name_8").value = data[i]["name"];
          } else if (i == 14) {
            document.getElementById("max_resistance").value = data[i]["max"];
            //document.getElementById("min_resistance").value = data[i]["min"];
            document.getElementById("param_resistance").value =
              data[i]["param"];
            document.getElementById("name_resistance").value = data[i]["name"];
          } else {
            if (i != 1) {
              if (!document.getElementById("max_" + i).disabled)
                document.getElementById("max_" + i).value = data[i]["max"];
              if (!document.getElementById("min_" + i).disabled)
                document.getElementById("min_" + i).value = data[i]["min"];
              if (i == 4) {
                document.getElementById("value_V_input").value =
                  data[i]["value_V_input"];
              }
              document.getElementById("time_" + i).value = data[i]["time"];
              document.getElementById("param_" + i).value = data[i]["param"];
              document.getElementById("name_" + i).value = data[i]["name"];
            } else {
              document.getElementById("time_" + i).value = data[i]["time"];
              document.getElementById("param_" + i).value = data[i]["param"];
              document.getElementById("name_" + i).value = data[i]["name"];
            }
          }
        }
        document.getElementById("delay").value = data["delay"];
        document.getElementById("com_port").value = data["com_port"];
        alert("Load Successful");
        get_connect_status();
        var i = 60;
        var thisinter = setInterval(() => {
          if (i <= 0) {
            clearInterval(thisinter);
            reset();
            i = 60;
          }
          if (start_counter == 0) {
            i--;
          } else {
            clearInterval(thisinter);
            i = 60;
          }
        }, 1000);
      }
    },
  });
}
