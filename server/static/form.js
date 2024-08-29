var fields = {};

document.addEventListener("DOMContentLoaded", function() {
  fields.namee = document.getElementById('namee');
  fields.company = document.getElementById('company');
  fields.mail = document.getElementById('mail');
  fields.phone = document.getElementById('phone');
  fields.conditions = document.getElementById('conditions');
  fields.message = document.getElementById('message');
})

class ContactForm {
  constructor(namee, company, mail, phone, conditions, message) {
    this.namee = namee;
    this.company = company;
    this.mail = mail;
    this.phone = phone;
    this.conditions = conditions;
    this.message = message;
  }
}

function isNotEmpty(value) {
  if (value == null || typeof value == 'undefined') return false;

  return (value.length > 0);
}

function isPhoneNumber(phone) {
  let regex = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;
  return regex.test(String(phone)); 
}

function isEmail(email) {
  let regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(String(email).toLowerCase()); 
}

function fieldValidation(field, validationFunction) {
  if (field == null) return false;

  let isFieldValid = validationFunction(field.value)
  if (!isFieldValid) {
    field.className = 'placeholderRed';
  } else {
    field.className = '';
  }

  return isFieldValid;
}

function isValid() {
  var valid = true;

  valid &= fieldValidation(fields.namee, isNotEmpty);
  valid &= fieldValidation(fields.mail, isEmail);
  valid &= fieldValidation(fields.mail, isNotEmpty);
  valid &= fieldValidation(fields.phone, isNotEmpty);
  valid &= fieldValidation(fields.phone, isPhoneNumber);
  valid &= fields.conditions.checked;

  return valid;
}

function sendForm(){
  if (isValid()) {
    let contact_form = new ContactForm(namee.value, 
      company.value,
      mail.value,
      phone.value,
      conditions.checked,
      message.value);
    
    fetch("http://localhost:3000/submit", {
      method: "POST",
      body: JSON.stringify({
        name: contact_form.namee,
        email: contact_form.mail,
        company: contact_form.company,
        phone: contact_form.phone,
        comment: contact_form.message,
        isAgree: contact_form.conditions
    }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then((response => {
        if  (response.ok) {
          alert(`заявка успешно отправлена`);
        } else {
          alert(`ошибка отправки формы, попробуйте позже`);
        }
      }))
      .catch((error) => {
        alert(`ошибка отправки формы, попробуйте позже`);        
      });      
  } else {
    alert("форма заполнена не верно");
  }
}