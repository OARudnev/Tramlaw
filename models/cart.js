module.exports = function Cart (oldCart) {
        this.items = oldCart.items || {};
        this.totalQuantity = oldCart.totalQuantity || 0;
        this.totalPrice = oldCart.totalPrice || 0;
        
     this.add = function (item, id) {
        let storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
    }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQuantity++;
        this.totalPrice += storedItem.item.price;
    };

    this.removeItem = function(id){
        if (!this) return;
        this.totalQuantity -= this.items[id].qty;
        this.totalPrice -= this.items[id].item.price * this.items[id].qty;
        delete this.items[id];
    }

    this.generateArray = function () {
        return Object.values(this.items);
    };
};