// alert("Before Starting Please ensure Serial device is connected");
var overall_device = 1;
var count = 0;
var delay_count = 0;
var task_interval;
var timer;
var start_counter = 0;
var status;
var hasReturned = "false";
var secondMicro = "false";

for (var i = 1; i <= 12; i++) {
  if (i == 1 || i == 12) {
  } else {
    console.log(document.getElementById("max_" + i).disabled);
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
document.getElementById("name_4").value = "Voltmeter";
document.getElementById("name_5").value = "VAW";
document.getElementById("name_9").value = "PF";
document.getElementById("name_8").value = "MicroAmpere";
document.getElementById("name_10").value = "20V";
document.getElementById("name_11").value = "30A";
document.getElementById("name_12").value = "Frequency";
document.getElementById("name_resistance").value = "Resistance";

document.getElementById("param_1").value = "kV";
document.getElementById("param_2").value = "mA";
document.getElementById("param_3").value = "MΩ";
document.getElementById("param_4").value = "V";
document.getElementById("param_5").value = "V";
document.getElementById("param_6").value = "A";
document.getElementById("param_7").value = "W";
document.getElementById("param_8").value = "μA-1";
document.getElementById("param_13").value = "μA-2";
document.getElementById("param_9").value = "";
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
    maximum: -10000,
    minimum: 10000,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    async: false,
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
    maximum: document.getElementById("max_2").value,
    minimum: document.getElementById("min_2").value,
  };

  $.ajax({
    type: "POST",
    async: false,
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
        turn_off_device_relay(2);
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
    maximum: document.getElementById("max_3").value,
    minimum: document.getElementById("min_3").value,
  };

  $.ajax({
    type: "POST",
    async: false,

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
          turn_off_device_relay(3);
        }, 2500);
        $("#result_3").css({ color: "red" });
      }
    },
  });
};

const processVoltmeter = (truth) => {
  console.log("processVoltmeter");
  const to_send = {
    secondMicro: "false",
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 4,
    maximum: document.getElementById("max_4").value,
    minimum: document.getElementById("min_4").value,
  };

  $.ajax({
    type: "POST",
    async: false,

    url: "/run_task",
    cache: false,
    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById("result_4").value = response;

      if (
        parseFloat(response) <= parseFloat(to_send["maximum"]) &&
        parseFloat(response) >= parseFloat(to_send["minimum"])
      ) {
        $("#result_4").css({ color: "green" });
      } else {
        turn_off_device_relay(4);
        $("#result_4").css({ color: "red" });
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
    async: false,
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
          turn_off_device_relay(5);
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
    maximum: document.getElementById("max_9").value,
    minimum: document.getElementById("min_9").value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    async: false,

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
        turn_off_device_relay(7);
      }
    },
  });
};

const processMicroAmp = (secondMicro, truth) => {
  console.log("processMicroAmp");
  let identifier = 9;
  const to_send = {
    secondMicro: false,
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 6,
    maximum: document.getElementById(`max_${identifier}`).value,
    minimum: document.getElementById(`min_${identifier}`).value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    async: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`#result_${identifier}`).value = response;

      if (
        parseFloat(response) <= parseFloat(to_send["maximum"]) &&
        parseFloat(response) >= parseFloat(to_send["minimum"])
      ) {
        $(`#result_${identifier}`).css({ color: "green" });
      } else {
        $(`#result_${identifier}`).css({ color: "red" });
        turn_off_device_relay(6);
      }
    },
  });
};

const processMicroAmp_2 = (truth) => {
  console.log("processMicroAmp");
  let identifier = 13;

  const to_send = {
    secondMicro: true,
    truth: truth,
    com: document.getElementById("com_port").value,
    device: 6,
    maximum: document.getElementById(`max_${identifier}`).value,
    minimum: document.getElementById(`min_${identifier}`).value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    async: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`#result_${identifier}`).value = response;

      if (
        parseFloat(response) <= parseFloat(to_send["maximum"]) &&
        parseFloat(response) >= parseFloat(to_send["minimum"])
      ) {
        $(`#result_${identifier}`).css({ color: "green" });
      } else {
        $(`#result_${identifier}`).css({ color: "red" });
        turn_off_device_relay(6);
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
    maximum: 100000,
    minimum: document.getElementById("min_10").value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    async: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`#result_10`).value = response;

      if (parseFloat(response) >= parseFloat(to_send["minimum"])) {
        $("#result_10").css({ color: "green" });
      } else {
        $("#result_10").css({ color: "red" });
        turn_off_device_relay(8);
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
    maximum: 100000,
    minimum: document.getElementById("min_11").value,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    async: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`#result_11`).value = response;

      if (parseFloat(response) >= parseFloat(to_send["minimum"])) {
        $("#result_11").css({ color: "green" });
      } else {
        $("#result_11").css({ color: "red" });
        turn_off_device_relay(9);
      }
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
    maximum: 100000,
    minimum: -1000000,
  };

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    async: false,

    data: to_send, // serializes the form's elements.
    success: function (response) {
      document.getElementById(`#result_12`).value = response;
    },
  });
};

const delayedFunction = (wrapper) => {
  const delayVal = parseInt(document.getElementById("delay").value);
  for (let i = 0; i < delayVal; i++) {
    wrapper(false);
  }
};

const timedFnction = (wrapper, time) => {
  let timed = 0;
  const delayedInterval = setInterval(() => {
    if (timed < time) {
      wrapper(true);
    } else {
      clearInterval(delayedInterval);
    }
    timed++;
  }, 1700);
};

function reset() {
  for (var i = 1; i <= 13; i++) {
    document.getElementById("result_" + i).value = "";
  }
  document.getElementById("result_resistance").value = "";
  document.getElementById("strt_butt").innerHTML = "Start";
  document.getElementById("device_id").value = "";
  clearInterval(timer);
  clearInterval(task_interval);
  overall_device = 1;
  count = 0;
  delay_count = 0;
  start_counter = 0;
  check_ext_trigg();
}

function turn_off_device_relay(device) {
  //turn off individual device relay
  $.ajax({
    type: "POST",
    url: "/turn_off_relay",
    data: {
      device: device,
      com_port: document.getElementById("com_port").value,
    }, // serializes the form's elements.
    success: function (data) {
      console.log("Relay Status : " + data);
    },
  });
}

function main_task(device) {
  console.log(device);
  if (device == 1 || device == 2) {
    if (delay_count <= parseInt(document.getElementById("delay").value)) {
      run_task("false", device);
      if (overall_device == 2) {
        overall_device = 1;
      } else if (overall_device == 1) {
        overall_device = 2;
      }
      delay_count++;
    } else {
      if (count <= parseInt(document.getElementById("time_1").value)) {
        run_task("true", device);
        if (overall_device == 2) {
          overall_device = 1;
        } else if (overall_device == 1) {
          overall_device = 2;
        }
      } else {
        overall_device = 3;
        turn_off_device_relay(2);

        delay_count = 0;
        count = 0;
      }
    }
  } else if (device == 8 || device == 9) {
    if (delay_count <= parseInt(document.getElementById("delay").value)) {
      run_task("false", device);
      if (overall_device == 8) {
        overall_device = 9;
      } else if (overall_device == 9) {
        overall_device = 8;
      }
      delay_count++;
    } else {
      if (count <= parseInt(document.getElementById("time_10").value)) {
        run_task("true", device);
        if (overall_device == 8) {
          overall_device = 9;
        } else if (overall_device == 9) {
          overall_device = 8;
        }
      } else {
        setTimeout(function () {
          turn_off_device_relay(8);
          setTimeout(function () {
            turn_off_device_relay(9);
          }, 1000);
        }, 1000);

        overall_device = 10;
        delay_count = 0;
        count = 0;
      }
    }
  } else {
    if (delay_count <= parseInt(document.getElementById("delay").value)) {
      run_task("false", device);
      delay_count++;
    } else {
      var time = device;
      if (device == 6) {
        time = 8;
      } else if (device == 7) {
        time = 9;
      } else if (device == 10) {
        time = 12;
      }
      if (count <= parseInt(document.getElementById("time_" + time).value)) {
        run_task("true", device);
      } else {
        if (device == 10) {
          setTimeout(function () {
            turn_off_device_relay(10);
          }, 800);

          overall_device = 1;
          delay_count = 0;
          count = 0;
          setTimeout(function () {
            stop();
            secondMicro = "false";
            save_result_data();
            start_counter = 0;
          }, 800);
        } else {
          turn_off_device_relay(overall_device);
          if (overall_device != 6) {
            overall_device++;
          } else if (overall_device == 6 && secondMicro == "true") {
            overall_device++;
            secondMicro = "false";
          } else {
            secondMicro = "true";
          }
          delay_count = 0;
          count = 0;
        }
      }
    }
  }
}

function stop() {
  start_counter = 0;
  overall_device = 1;
  stop_sequence();
  turn_off_device_relay(overall_device);
  check_ext_trigg();
  document.getElementById("strt_butt").disabled = false;

  clearInterval(timer);
  clearInterval(task_interval);
}

function start() {
  // timer = setInterval(() => {
  //   majorStart();
  // }, 1000);
  if (document.getElementById("device_id").value == "") {
    alert("Enter Device ID");
    start_counter = 0;

    check_ext_trigg();

    return;
  }
  if (document.getElementById("ser_status").innerHTML == "Disconnected") {
    alert("Serial Connection Not Found");
    start_counter = 0;
    if (hasReturned == "true") {
      hasReturned = "false";
    }
    load_config();
    return;
  }
  console.log("STarting TASK");
  //check_stop_trigg();
  start_counter = 1;
  start_sequence();
  document.getElementById("strt_butt").disabled = true;
  if (document.getElementById("strt_butt").innerHTML == "Resume") {
    var val = document.getElementById("device_id").value;
    reset();
    stop();
    start_counter = 1;
    start_sequence();
    document.getElementById("device_id").value = val;
    document.getElementById("strt_butt").innerHTML = "Start";
  }
  clearInterval(status);
  timer = setInterval(function () {
    count++;
  }, 1000);
  task_interval = setInterval(function () {
    main_task(overall_device);
  }, 1500);
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

function check_ext_trigg() {
  //##checking external trigger

  $.ajax({
    type: "POST",
    url: "/check_ext_trigg",
    data: { com_port: document.getElementById("com_port").value },
    success: function (data) {
      hasReturned = "true";
      if (data == "1") {
        console.log(data);
        if (start_counter == 1) {
        } else {
          start_counter = 1;
          start();
        }
      }
    },
  });
}

function check_stop_trigg() {
  //##checking external trigger

  $.ajax({
    type: "POST",
    url: "/check_stop_trigg",
    data: { com_port: document.getElementById("com_port").value },
    success: function (data) {
      hasReturned = "true";
      if (data == "1") {
        console.log(data);
        if (start_counter == 1) {
        } else {
          start_counter = 1;
          stop();
        }
      }
    },
  });
}

function stop_task() {
  clearInterval(task_interval);
}

function save_result_data() {
  var curr_config = {};
  curr_config["device_id"] = document.getElementById("device_id").value;
  for (var i = 1; i <= 14; i++) {
    var temp_config = {};
    if (i > 5 && i < 8) {
      temp_config["name"] = document.getElementById("name_5").value;

      temp_config["param"] = document.getElementById("param_" + i).value;
      temp_config["result"] = document.getElementById("result_" + i).value;
      if (document.getElementById("result_" + i).style.color == "red") {
        temp_config["status"] = "Failed";
      } else {
        temp_config["status"] = "Passed";
      }
      curr_config[i.toString()] = temp_config;
    } else if (i == 13) {
      temp_config["name"] = document.getElementById("name_8").value;
      if (document.getElementById("result_" + i).style.color == "red") {
        temp_config["status"] = "Failed";
      } else {
        temp_config["status"] = "Passed";
      }
      temp_config["param"] = document.getElementById("param_" + i).value;
      temp_config["result"] = document.getElementById("result_" + i).value;
      curr_config[i.toString()] = temp_config;
    } else if (i == 14) {
      temp_config["name"] = document.getElementById("name_resistance").value;
      if (document.getElementById("result_resistance").style.color == "red") {
        temp_config["status"] = "Failed";
      } else {
        temp_config["status"] = "Passed";
      }
      temp_config["param"] = document.getElementById("param_resistance").value;
      temp_config["result"] =
        document.getElementById("result_resistance").value;
      curr_config[i.toString()] = temp_config;
    } else {
      temp_config["name"] = document.getElementById("name_8").value;
      temp_config["name"] = document.getElementById("name_" + i).value;
      if (document.getElementById("result_" + i).style.color == "red") {
        temp_config["status"] = "Failed";
      } else {
        temp_config["status"] = "Passed";
      }
      temp_config["param"] = document.getElementById("param_" + i).value;
      temp_config["result"] = document.getElementById("result_" + i).value;
      curr_config[i.toString()] = temp_config;
    }
  }

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

function run_task(truth, device) {
  if (device == 5) {
    var to_send = {
      secondMicro: "false",
      truth: truth,
      com: document.getElementById("com_port").value,
      device: device,
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
  } else if (device == 6 && secondMicro == "true") {
    var to_send = {
      secondMicro: secondMicro,
      truth: truth,
      com: document.getElementById("com_port").value,
      device: device,
      maximum: document.getElementById("max_13").value,
      minimum: document.getElementById("min_13").value,
    };
  } else {
    var val = device;
    if (device > 5) {
      val = device + 2;
    }
    var to_send = {
      secondMicro: "false",
      truth: truth,
      com: document.getElementById("com_port").value,
      device: device,
      maximum: document.getElementById("max_" + val).value,
      minimum: document.getElementById("min_" + val).value,
    };
  }

  $.ajax({
    type: "POST",
    url: "/run_task",
    cache: false,
    data: to_send, // serializes the form's elements.

    success: function (response) {
      if (device == 5) {
        list = Object.values(JSON.parse(response))[0];
        for (var i = 0; i < list.length; i++) {
          var val = device + i;
          var max = document.getElementById("max_" + val).value;
          var min = document.getElementById("min_" + val).value;
          document.getElementById("result_" + val).value = list[i];
          if (list[i] <= parseFloat(max) && list[i] >= parseFloat(min)) {
            $("#result_" + val).css({ color: "green" });
          } else {
            $("#result_" + val).css({ color: "red" });
            //stop();
          }
        }
      } else if (device == 1) {
        list = Object.values(JSON.parse(response))[0];
        document.getElementById("result_1").value =
          list[1] == 2 ? list[0] + "-Failed" : list[0] + "-Passed";
        if (list[1] == 2) {
          stop();
          turn_off_device_relay(1);
          $("#result_1").css({ color: "red" });
        } else {
          $("#result_1").css({ color: "green" });
        }
      } else if (device == 6 && secondMicro == "true") {
        document.getElementById("result_13").value = response;
        if (
          parseFloat(response) <= parseFloat(to_send["maximum"]) &&
          parseFloat(response) >= parseFloat(to_send["minimum"])
        ) {
          $("#result_13").css({ color: "green" });
        } else {
          $("#result_13").css({ color: "red" });
        }
      } else {
        var val = device;
        if (device > 5) {
          val = device + 2;
        }
        if (val === 9) {
          document.getElementById("result_" + val).value = Math.abs(response);
        } else {
          document.getElementById("result_" + val).value = response;
        }

        if (val === 11) {
          $("#result_" + val).css({ color: "green" });
          const twentyvolt = document.getElementById("result_10").value;
          const twentyvoltmin = document.getElementById("min_10").value;
          const thirtyamp = document.getElementById("result_11").value;
          const resis = ((twentyvolt - twentyvoltmin) / thirtyamp).toFixed(3);
          document.getElementById("result_resistance").value = resis;
          if (resis < document.getElementById("max_resistance").value) {
            $("#result_resistance").css({ color: "green" });
          } else {
            $("#result_resistance").css({ color: "red" });
          }
        }

        if (
          parseFloat(response) <= parseFloat(to_send["maximum"]) &&
          parseFloat(response) >= parseFloat(to_send["minimum"])
        ) {
          $("#result_" + val).css({ color: "green" });
        } else {
          if (device == 3) {
            var temp = parseInt(document.getElementById("delay").value);
            if (delay_count <= temp) {
            } else {
              setTimeout(function () {
                stop();
                turn_off_device_relay(3);
              }, 1000);
            }
          }
          if (val !== 11) {
            $("#result_" + val).css({ color: "red" });
          }
        }
      }
    },
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
        check_ext_trigg();
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
