
/*---------------------------BUDGET CONTROLLER----------------------*/


var budgetController = (function () {

	var Expenses, Income, data;

	Expenses = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expenses.prototype.calcPercentage = function(totalInc) {
		if (totalInc > 0) {
			this.percentage = Math.round((this.value / totalInc) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expenses.prototype.getPercentage = function() {
		return this.percentage;
	};

	Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function (type) {
		var sum = 0;

		data.allItems[type].forEach(function (current) {
			sum += current.value;
		});

		data.totals[type] = sum;

	};

	data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function (type, des, val) {
			var newItem, ID;

			
			if (data.allItems[type].length === 0) {
				ID = 0;
			} else {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}
			

			if (type === 'exp') {
				newItem = new Expenses(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			
			data.allItems[type].push(newItem);

			return newItem;

		},

		data,

		calculateBudget: function () {
			// calculate total income and expenses

			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget:income - expenses

			data.budget = data.totals.inc - data.totals.exp;

			// calculate the percentage
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} 

		},

		getBudget: function () {
			return {
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				budget: data.budget,
				percentage: data.percentage

			};
		},

		deleteItem: function (type, ID) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(ID);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}

			
		},

		calculatePercentage: function () {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function () {
			var allPer = data.allItems.exp.map(function (cur) {
				return cur.getPercentage();
			});
			return allPer;
		}

	}


})();







/*---------------------------USER INTERFACE----------------------*/


var UIContoller = (function () {

	var DOMstrings = {
		inputType: '.operation',
		inputDescription: '.name',
		inputValue: '.value',
		inputBtn: '.enter',
		incomeContainer: '.income_list',
		expenseContainer: '.expenses_list',
		budgetLabel: '.budget',
		incomeLabel: '.income .amount',
		expensesLabel: '.expenses .amount',
		percentageLabel: '.exp_per',
		container: '.bottom',
		expensesPercLabel: '.percent'
	}

	return {

		getDOMStrings: function () {
			return DOMstrings;
		},

		getInput: function () {
			return {
				type: document.querySelector(DOMstrings.inputType).value, /*will be either inc or exp*/
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
			
		},

		addListItem: function (obj, type) {
			// define variables

			var html, newHtml, element;


			// check if user filled the fields right

			if (isNaN(obj.value) || obj.description === '' || obj.value <= 0) {
				alert('You missed something!');
			} else {


				// placeholder text

				if (type === 'inc') {
					element = DOMstrings.incomeContainer;
					html = '<div id="inc_%id%" class="item"><h3 class="inc_des">%description%</h3><div class="value_wrap"><span class="inc_val">+%value%</span><button class="delete"><img src="img/delete.png"></button></div></div>';
				} else if (type === 'exp') {
					element = DOMstrings.expenseContainer;
					html = '<div id="exp_%id%" class="item"><h3 class="exp_des">%description%</h3><div class="value_wrap"><span class="exp_val">-%value%</span><span class="percent">21%</span><button class="delete"><img src="img/delete.png"></button></div></div>';
				};


				// change placeholder text to one that user entered

				newHtml = html.replace('%id%', obj.id);
				newHtml = newHtml.replace('%description%', obj.description);
				newHtml = newHtml.replace('%value%', obj.value);


				// replace placeholder text in html file

				document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

			}
		}, 

		deleteListItem: function (selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},


		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function (current, index, array) {
				current.value = '';
			});

			fieldsArr[0].focus();

		},

		displayBudget: function (obj) {
			if (obj.budget >= 0) {
				document.querySelector(DOMstrings.budgetLabel).textContent = '+' + obj.budget;
			} else if (obj.budget < 0) {
				document.querySelector(DOMstrings.budgetLabel).textContent = '-' + obj.budget;
			};
			
			document.querySelector(DOMstrings.incomeLabel).textContent = '+' + obj.totalInc;
			document.querySelector(DOMstrings.expensesLabel).textContent = '-' + obj.totalExp;

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			};
			

		},

		displayPercentages: function (percentages) {
			
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			for (var i = 0; i < fields.length; i++) {
				if (percentages[i] > 0) {
					fields[i].textContent = percentages[i] + '%';
				} else {
					fields[i].textContent = '---';
				};
			};
		},

	}

})();











/*---------------------------COMMON CONTROLLER----------------------*/


var controller = (function (budgetCtrl, UICtrl) {

	var setupEventListeners = function () {
				var DOM = UICtrl.getDOMStrings(); /*shortcuts for html classes names*/

				document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);		
				document.addEventListener('keypress', function(event) {
					
					if (event.keyCode === 13 || event.which === 13) {
						event.preventDefault();
						ctrlAddItem();
					}
		
				});

				document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

			};

	var updateBudget = function () {
		// Calculate the budget
		
		budgetCtrl.calculateBudget();

		// return the budget

		var budget = budgetCtrl.getBudget();

		// display the budget

		UICtrl.displayBudget(budget);

	}

	var updatePercentage = function () {
		// calculate the percentage
		budgetCtrl.calculatePercentage();
		// get the calculated persentages
		var percentages = budgetCtrl.getPercentages();
		// update UI
		UICtrl.displayPercentages(percentages);
	}

	var ctrlAddItem = function () {
		var input, newItem;


		// Get input data

		input = UICtrl.getInput();


		// Add item to the budget controller

		newItem = budgetCtrl.addItem(input.type, input.description, input.value);
	

		// Add item to the UI

		UICtrl.addListItem(newItem, input.type);

		// Clear input fields
	
		UICtrl.clearFields();

		// calculate the budget

		updateBudget();

		// update percentage
		updatePercentage();
	}

	var ctrlDeleteItem = function (event) {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.id;

		if (itemID) {

			splitID = itemID.split('_');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			
			// delete item from the data structure
			budgetCtrl.deleteItem(type, ID);

			// delete item from the UI
			UICtrl.deleteListItem(itemID);

			//update and show the new budget
			updateBudget();

			// update percentage
			updatePercentage();		
		}
	}

	return {
		init: function () {
			console.log('Initialization has started')
			setupEventListeners();
		}
	}

})(budgetController, UIContoller);

controller.init();

