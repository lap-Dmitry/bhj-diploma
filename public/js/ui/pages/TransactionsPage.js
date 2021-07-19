/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor( element ) {
    if (!element) {
      throw new Error('Элемент отсутствует')
    }
    this.element = element;
    this.registerEvents();
    this.lastOptions = false;
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    this.render(this.lastOptions);
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    const btn = document.getElementsByClassName('btn-danger');

    if (!this.lastOptions) {
      Array.from(btn).forEach((i) => {
        if (i.classList.contains('remove-account')) {
          i.addEventListener('click', (e) => {
            e.preventDefault();
            this.removeAccount();
          })
        }
      })
    } else {
      Array.from(btn).forEach((i) => {
        if (i.classList.contains('transaction__remove')) {
          i.addEventListener('click', () => {
            let id = i.dataset.id;
            this.removeTransaction(id);
          })
        }
      })
    }
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets(),
   * либо обновляйте только виджет со счетами
   * для обновления приложения
   * */
  removeAccount() {
    if (!this.lastOptions) {
      return false
    } else {
      let id = this.lastOptions.account_id
      let obj = {id};
      if (window.confirm('Вы действительно хотите удалить этот счёт?')) {
        Account.remove(obj, (err, response) => {
          this.clear();
          App.update();
        })
      }
    }
}

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction( id ) {
    let obj = {id};
    if (window.confirm('Вы действительно хотите удалить эту транзакцию?')) {
      Transaction.remove(obj, (err, response) => {
        if (response.success) {
          App.update();
        }
      })
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options){
    if (!options) {
      return false;
    }
    this.lastOptions = options;

    Account.get(options.account_id, (err, response) => {
      try {
        let int = response.data.findIndex(item => item.id == options.account_id);
        this.renderTitle(response.data[int].name);
      } catch(err) {
        window.alert(err);
      }
      Transaction.list(options, (err, response) => {
        try {
          this.renderTransactions(response.data);
        } catch(err) {
          window.alert(err);
        }
      })
    })
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    let data = [];
    this.renderTransactions(data);
    this.renderTitle('Название счёта');
    this.lastOptions = false;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name){
    const title = document.querySelector('.content-title');
    title.textContent = `${name}`
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date){
    let newDate = new Date(date);
    let arr = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    return `${newDate.getDate()} ${arr[newDate.getMonth()]} ${1900+newDate.getYear()} г. в ${newDate.getHours()}:${newDate.getMinutes()}`;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item){
    let element = `
    <div class="transaction transaction_${item.type} row">
    <div class="col-md-7 transaction__details">
      <div class="transaction__icon">
          <span class="fa fa-money fa-2x"></span>
      </div>
      <div class="transaction__info">
          <h4 class="transaction__title">${item.name}</h4>
          <div class="transaction__date">${this.formatDate(item.created_at)}</div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="transaction__summ">
       ${item.sum}<span class="currency">₽</span>
      </div>
    </div>
    <div class="col-md-2 transaction__controls">
        <button class="btn btn-danger transaction__remove" data-id="${item.id}">
            <i class="fa fa-trash"></i>  
        </button>
    </div>
</div>
    `
    return element
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data){
    const section = document.querySelector('.content');
    section.innerHTML = "";
    data.forEach((i) => {
      let element = this.getTransactionHTML(i)
      section.innerHTML += element;
    })
    this.registerEvents();
  }
}