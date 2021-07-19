/**
 * Класс CreateAccountForm управляет формой
 * создания нового счёта
 * */
class CreateAccountForm extends AsyncForm {
  /**
   * Создаёт счёт с помощью Account.create и закрывает
   * окно в случае успеха, а также вызывает App.update()
   * и сбрасывает форму
   * */
   onSubmit(options) {
    Account.create(options, (err, response) => {
      if (err === null) {
        if (response.success) {
          App.getModal('createAccount').close();
          this.element.reset();
          App.update();
        } else {
          alert(JSON.stringify(response.error));
        }
      }
    });
  }
}