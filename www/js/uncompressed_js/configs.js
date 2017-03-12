var app = angular.module('configs', [])
.value("configs",{
  flags: ["Australia", "Nepal",  "USA", "UK"],
  country: function(){
              if(localStorage.getItem("country") === null || localStorage.getItem("country") === ""){
                return "Australia";
              }else{
                return localStorage.getItem("country");
                }
            },
  filter:{
    zipCode : ["USA"],
    title : ["USA", "Australia", "Nepal", "UK"],
    city : ["USA"]
  },
  currencyUnit:{
    USA:"$",
    Australia: "$",
    Nepal: "Rs.",
    UK: "£"
  },
  features:{
    fullAddressFeature: ["USA"]
  },
  geoDivision : {
      "USA"  : ["state", "city"],
      "Nepal" : ["city"],
      "UK" : ["city"],
      "Australia" : ["city"]
    }
  })
