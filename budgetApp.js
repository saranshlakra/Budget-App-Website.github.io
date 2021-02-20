"use strict";
/* ----1--- */ let appController = (function () {
  let Expense = function (id, description, value) {
    // we use capital 'E' for expense because it is a fn constructor
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  let Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    total: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1, // we use -1 to show that this value is not exist
  };
  let calcIncExp = function (type) {
    let totalIncExp = 0;
    for (let i = 0; i <= data.allItems[type].length - 1; i++) {
      totalIncExp = totalIncExp + data.allItems[type][i].value;
      console.log(data.allItems[type][i].value);
      console.log(totalIncExp);
    }
    data.total[type] = totalIncExp;
    //return totalIncExp;
  };

  let calcBudget = function () {
    data.budget = data.total.inc - data.total.exp;
    console.log(data.budget);
  };

  let calcPercentage = function () {
    if (data.total.inc > 0) {
      data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
    } else {
      data.percentage = -1;
    }
    console.log(data.percentage + "%");
  };
  return {
    addItem: function (type, description, value) {
      let newItem, id;

      //create new id
      id = 0;
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      //create new Item
      if (type === "exp") {
        newItem = new Expense(id, description, value);
      } else if (type === "inc") {
        newItem = new Income(id, description, value);
      }
      //storing Items in arrays(data)
      data.allItems[type].push(newItem);
      return newItem;
    },
    budgetCalc: function () {
      // type coming from calcinc from backend controller
      // calcIncExp(type); // ismein error arhai hai jismein budget remove ke baad jab income remove kr rhe hai to change nhiho rha final mein
      calcIncExp("inc");
      calcIncExp("exp");
      calcBudget();
      calcPercentage();
    },

    getBudget: function () {
      return {
        budget: data.budget,
        income: data.total.inc,
        expense: data.total.exp,
        percentage: data.percentage,
      };
    },

    deleteItem: function (type, id) {
      let del, delIdIndex;
      del = data.allItems[type].map(function (currentid) {
        return currentid.id;
      });

      console.log(del); // to check this write appController.deleteItem('inc or exp', 2); in     console.
      console.log(data.allItems[type]);
      delIdIndex = del.indexOf(id);
      console.log(delIdIndex);

      if (delIdIndex !== -1) {
        //ye db se delete kardega item ko
        // -1 when it doesn't find the index(or undefined aaye)
        data.allItems[type].splice(delIdIndex, 1); // splice( jaha se start karna hai del karna, kitne element delete krne hai )
      }
    },

    calcPercentage: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.total.inc);
      });
    },

    getPercentages: function () {
      var allperc = data.allItems.exp.map(function (value) {
        return value.getPercentage();
      });
      return allperc;
    },
    //just for console testing
    testing: function () {
      console.log(data);
    },
  };
})();

/* ----2---- */
let uiController = (function () {
  let DOMstrings = {
    // now whenever we want to change any class or id in html/css then we just need to change it from here not from every where because we put ( for eg. DOMstrings.inputDescription ) at all the place.
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    input_btn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    expPercentageLabel: ".item__percentage",
    container: ".container",
    item: ".item",
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    getDOMstrings: function () {
      // here we are just returning DOMstring to public scope so that other module can get its access.
      return DOMstrings;
    },

    addItemToList: function (obj, type, objBudget) {
      let html, newHtml, element;

      // Creating new strings with placeholder text
      if (type === "inc") {
        // ye type 'inc' hai bcuz html mein inc likhi hai iski value
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;
        html =
          ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">-  %value%</div><div class="item__percentage">#21%#</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // Replacing placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      // Inserting some actual data
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    // clearing fields/placeholder(Description, Value)
    clearFields: function () {
      let fields, fieldsArray;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function (currentField) {
        currentField.value = "";
      });
      // console.log(fields);
    },
    displayBIEP: function (objBudget) {
      document.querySelector(DOMstrings.budgetLabel).textContent =
        objBudget.budget;
      if (objBudget.budget > 0) {
        document.querySelector(DOMstrings.budgetLabel).textContent =
          "+ " + objBudget.budget;
      }
      document.querySelector(DOMstrings.incomeLabel).textContent =
        objBudget.income;
      document.querySelector(DOMstrings.expenseLabel).textContent =
        objBudget.expense;
      if (objBudget.expense > 0) {
        document.querySelector(DOMstrings.expenseLabel).textContent =
          "- " + objBudget.expense;
      }
      if (objBudget.income > 0) {
        document.querySelector(DOMstrings.incomeLabel).textContent =
          "+ " + objBudget.income;
        document.querySelector(DOMstrings.percentageLabel).textContent =
          objBudget.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "....";
      }
      // document.querySelector(DOMstrings.percentage1Label).textContent =
      //   objBudget.percentage + "%";
    },

    displayPercentage: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);
      var NodeListforEach = function (list, callback) {
        // we make this seperate fb to use it in future for any nodelist
        for (var i = 0; i <= list.length; i++) {
          callback(list[i], i); // here we use first class fn concept.
        }
      };
      NodeListforEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else if (percentages[index] < 0) {
          current.textContent = "....";
        }
      });
    },
    removeItem: function (itemID) {
      let el = document.getElementById(itemID);
      el.parentNode.removeChild(el);
    },
  };
})();

/* ----3---- */
let backendController = (function (appCtrl, uiCtrl) {
  // It is the module, where we tell other modules; What to do..

  let setupEventListners = function () {
    let DOM = uiCtrl.getDOMstrings();
    let clickEnter = function (event) {
      if (event.keyCode === 13 || event.which === 1) {
        getItem();
      }
    }; // press click or enter to add value to db function.

    document.querySelector(DOM.input_btn).addEventListener("click", clickEnter);
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem); // here we select container class as target, event delegation.
    document.addEventListener("keypress", clickEnter);
  };

  let updateBudget = function (gettype) {
    appController.budgetCalc(gettype); //1 calculate budget

    var finalBudget = appController.getBudget(); //2 get budget

    uiController.displayBIEP(finalBudget); //3 display budget
  };

  let getItem = function () {
    var input, newItem;
    input = uiCtrl.getInput();
    console.log(input); // only for testing purpose
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = appController.addItem(
        input.type,
        input.description,
        input.value
      );
      console.log(input.type); // only for testing purpose
      console.log(newItem);
      // console.log(percentage);
      var finalBudget1 = appController.getBudget(); //2 get budget

      uiController.addItemToList(
        newItem,
        input.type,
        updatePercentage.percentages
      );
      uiController.clearFields();
      updateBudget();
      updatePercentage();
    }
  };

  let updatePercentage = function () {
    // 1. calculate percentage for each expense
    appController.calcPercentage();

    // 2. get percentage for each expenses
    var percentages = appController.getPercentages();

    // 3. update the ui with new percentages
    uiController.displayPercentage(percentages);
  };

  let ctrlDeleteItem = function (event) {
    let itemID, splitID, type, id;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);
    }

    // 1. Delete the item from the data structure/db
    appController.deleteItem(type, id);
    // 2. Delete the item from UI
    uiController.removeItem(itemID);
    // 3. Update and show the new budget/calculation to the UI
    updateBudget();
  };

  return {
    init: function () {
      console.log("HELLO FRIENDS");
      // clickEnter;
      setupEventListners();
    },
  };
})(appController, uiController);

backendController.init();

/*---------Traditional way to repeat value like we need in line 228---------
let a = ".parentNode";
let b = 4 * a;
b.toString;
console.log(b);
let str, a1;
function repeatString(str, number) {
  a1 = "";

  while (number > 0) {
    a1 += str;
    number--;
  }

  return a1;
}

repeatString(".parentNode", 4);
console.log(a1);

//----------------new way of repeating strings------------------
let b1 = ".parentNode";
let b2 = b1.repeat(4);
console.log(b2);
*/
/*---------Understanding map() method-------------
var ac = ["a1", "a3", "a2", "a4", "a8", "a7"];
var b = ac.map(function (value1) {
  value1 = value1.c1;
  return value1;
});
console.log(b);
var c = ac.indexOf(3);
console.log(ac);
console.log(c);
*/
