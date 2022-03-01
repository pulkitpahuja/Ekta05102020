var result_data = {};

const readSingleFile = (e) => {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  result_data.name = e.target.files[0].name;
  var reader = new FileReader();
  reader.onload = function (e) {
    var contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
};

const displayContents = (contents) => {
  result_data.data = contents;
  contents = JSON.parse(contents);

  document.getElementById("device_id").textContent = contents["device_id"];
  document.getElementById("datetime").textContent = contents["datetime"];

  delete contents["device_id"];
  delete contents["datetime"];
  const data_row = document.getElementById("data_row");

  Object.keys(contents).forEach((key) => {
    data_row.appendChild(`<div class="card col-2 text-center">
    <div class="card-header">
      <strong>${contents[key].name}</strong>
    </div>
    <div class="card-body">
      <h5 class="card-title">${contents[key].result}</h5>
    </div>
    <div class="card-footer">
      <strong>${contents[key].status}</strong>
    </div>
  </div>`);
  });
};

document
  .getElementById("file-input")
  .addEventListener("change", readSingleFile, false);

$("#exampleModalCenter").on("show.bs.modal", function (event) {
  document.getElementById("alert").textContent = "";
  $("#downloadFullCSV").on("click", () => {
    $("#alert").css({ color: "black" });
    document.getElementById("alert").textContent =
      "Please Wait your file is being processed...";
    var start_date = document.getElementById("start_date").value;
    var end_date = document.getElementById("end_date").value;
    var name = document.getElementById("name").value;
    console.log(start_date);
    if (start_date == "") {
      document.getElementById("alert").textContent = "Please Enter Start Date";
      $("#alert").css({ color: "red" });
      return;
    }
    if (end_date == "") {
      document.getElementById("alert").textContent = "Please Enter End Date";
      $("#alert").css({ color: "red" });
      return;
    }
    if (name == "") {
      document.getElementById("alert").textContent =
        "Please Enter Name Of Organization";
      $("#alert").css({ color: "red" });
      return;
    }
    console.log(start_date, end_date);
    $.ajax({
      type: "POST",
      url: "/csv_dated",
      data: JSON.stringify({
        org: name,
        start_date: start_date,
        end_date: end_date,
      }), // serializes the form's elements.
      success: (data) => {
        document.getElementById("alert").textContent = "Status: " + data;
      },
    });
  });
});

const changeorg = () => {
  document.getElementById("org_id").innerHTML =
    "<input type='text' id='org_text'><button class='btn btn-primary' id='org_save' type='button'>Save</button>";
  $("#org_save").on("click", () => {
    document.getElementById("org_id").innerHTML =
      document.getElementById("org_text").value;
  });
};

const download_csv = () => {
  console.log(result_data);
  $.ajax({
    type: "POST",
    url: "/download_csv",
    data: JSON.stringify(result_data), // serializes the form's elements.
    success: (data) => {
      alert(data);
    },
  });
};
