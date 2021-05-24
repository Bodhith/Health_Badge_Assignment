
$(document).ready(function(){

    // This way, adding more heading is easier and also supports mapping
    // ambigious keys in JSON to UI-Table Heading.
    const headings = {
      id: "Id",
      name: "Name",
      username: "Username",
      email: "Email",
      website: "Website",
      phone: "Phone"
    };

    const maxRows = 1000;

    makeTable();

    function attachButtonEventListners() {
      $("#addRowButton").click(function() {
        addRow();
        $("#addRowButton").prop("disabled", true);
      });

      $("#deleteRowButton").click(function() {
        deleteRow();
      });
    }

    function sendUserData(userData) {
      $.ajax({
        url: "http://localhost:3000/userData",
        type: 'POST',
        dataType: 'text',
        data: userData,
        success: (res) => {
          console.log("Send User Data Sent.");
        },
        error: (xhr, status, error) => {
          console.log("Send User Data Failed.");
          console.log(xhr);
        }
      });

      return new Promise(function(resolve, reject) {
        resolve(userData);
      });
    }

    function addRow() {
      var rowIdHash = {};
      $("#landingTable tbody tr").each(function() {
        rowIdHash[this.id] = true;
      });

      var newRowId = Math.floor(Math.random()*maxRows);
      while( rowIdHash["row"+newRowId] ) {
        newRowId = Math.floor(Math.random()*maxRows);
      }

      $("#landingTable tbody").append("<tr id=row"+newRowId+"></tr>");

      $("#landingTable tbody #row"+newRowId).append(`
        <td>
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="checkbox`+newRowId+`">
            <label class="custom-control-label" for="checkbox`+newRowId+`"></label>
          </div>
        </td>
        <td>
          `+newRowId+`
        </td>
      `);

      var headingKeys = Object.keys(headings);

      $.each(headingKeys, function(index, headingKey) {
        if( headingKey != "id" ) {
          $("#landingTable tbody #row"+newRowId).append(`
            <td>
              <input type="text" class="form-control" placeholder="`+headings[headingKey]+`">
            </td>
          `);
        }
      });

      $("#landingTable tbody #row"+newRowId).click();

      $(document).keypress(function(event) {
        if(event.keyCode == 13 ) {
          var userData = {};
          userData["id"] = newRowId;
          $("#landingTable tbody #row"+newRowId+" input:not(:checkbox)").each(function(index, userInput) {
              // +1 becuase we added ID already into our userData above
              // userData["id"] should be added separetly because this JQuery
              // selector starts from 3rd feild ignoring check box and ID however,
              // our headingKeys starts from ID, to counter that 1 offset we add +1
              userData[headingKeys[index+1]] = userInput.value;
          });
          sendUserData(userData).then(function(userData) {
            $("#addRowButton").prop("disabled", false);

            $("#landingTable tbody #row"+newRowId+" input:not(:checkbox)").parent().remove();

            $.each(headingKeys, function(index, headingKey) {
              if( headingKey != "id" ) {
                $("#landingTable tbody #row"+newRowId).append(`
                  <td>
                    `+userData[headingKey]+`
                  </td>
                `);
              }
            });

            updateRowsCount();
          });
        }
      });
    }

    function deleteRow() {
      var idsToDelete = {};
      let ids = "";
      let id;
      $("#landingTable :checkbox").each(function() {
        if( this.checked == true && this.id != "tableSelectAllCheckBox" ) {
          id = this.id;
          // The format for all checkbox are "checkbox{id}", slice the first 7
          // characters to get the id.
          id = id.slice(8, id.length);
          ids += " " + id.toString();
        }
      });
      idsToDelete["ids"] = ids;

      $.ajax({
        url: "http://localhost:3000/deleteUser",
        type: 'POST',
        dataType: 'text',
        data: idsToDelete,
        success: (res) => {
          console.log("Delete User Request Sent.");
        },
        error: (xhr, status, error) => {
          console.log("Delete User Request Failed.");
          console.log(xhr);
        }
      });
      
      $.each(idsToDelete, function(index, id) {
        $("#landingTable #row"+id).remove();
      });
      // If not in db and is here, and user wants to delete that row, we can activate
      // Add Row again.
    }

    function tableCounters(){
      // Select All/De-Select All Functionaliy
      $("#landingTable").on("change", "#tableSelectAllCheckBox", function() {
        if( this.checked == true ) {
            $("#landingTable :checkbox").prop("checked", true);
        }
        else {
            $("#landingTable :checkbox").prop("checked", false);
        }
      });

      // Selected Rows Functionality
      $("#landingTable").on("change", ":checkbox", function() {
        let checkedBoxesCount = 0;
        $(":checkbox").each(function() {
          if( this.checked == true && this.id != "tableSelectAllCheckBox" ) {
              checkedBoxesCount++;
          }
        });
        $("#selectedRowsCount").html(checkedBoxesCount);
      });
    }

    function updateRowsCount() {
      $.ajax({
            url: "http://localhost:3000/usersCount",
            type: 'GET',
            dataType: 'text',
            success: (res) => {
              console.log("Fetch Users Count Success.");
              $("#rowsCount").html(res);
            },
            error: (xhr, status, error) => {
              console.log("Fetch Users Count Error");
              console.log(xhr);
            }
        });
    }

    function makeTable() {
      $.ajax({
            url: "http://localhost:3000",
            type: 'GET',
            dataType: 'text', // added data type
            success: (res) => {
              console.log("Fetch Table Data Success");
              insertTable(JSON.parse(res)).then(function(tableData) {
                $("#tableButtonsDiv").prop('hidden', false);
                $("#tableButtonsDiv").prop('hidden', false);

                $("#rowsCount").html(tableData.length);
                $("#selectedRowsCount").html(0);

                tableCounters();
                attachButtonEventListners();
              });
            },
            error: (xhr, status, error) => {
              console.log("Fetch Table Data Error");
              console.log(xhr);
            }
        });
        // Optimize Row Id
        function insertTable(tableData) {

          $("#landingTable").append("<thead></thead>");
          $("#landingTable thead").append("<tr></tr>");

          //  Set Table Heading
          $("#landingTable thead tr").append(`
            <th>
              <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" id="tableSelectAllCheckBox">
                <label class="custom-control-label" for="tableSelectAllCheckBox">Select All</label>
              </div>
            </th>
          `);

          $.each(headings, function(key, heading) {
              $("#landingTable thead tr").append("<th>"+heading+"</th>");
          });

          // Set Table Body
          $("#landingTable").append("<tbody></tbody>");

          $.each(tableData, function(rowIndex, data) {
            $("#landingTable tbody").append("<tr id='row"+data["id"]+"'></tr>");
            $("#landingTable tbody #row"+data["id"]).append(`
              <td>
                <div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input" id="checkbox`+data["id"]+`">
                  <label class="custom-control-label" for="checkbox`+data["id"]+`"></label>
                </div>
              </td>
            `);

            var headingKeys = Object.keys(headings);

            $.each(headingKeys, function(headingIndex, key) {
              $("#landingTable tbody #row"+data["id"]).append(`
                <td>
                  `+data[key]+`
                </td>
              `);
            });
          });

          return new Promise(function(resolve, reject) {
            resolve(tableData);
          });
        }
    }
});
