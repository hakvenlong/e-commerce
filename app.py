from flask import Flask, render_template, request, jsonify, session

# app = Flask(__name__, static_url_path='/static', static_folder='static')
app = Flask(__name__, static_folder='static')
app.secret_key = 'your_secret_key'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/shop')
def shop():
    return render_template('shop.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/account')
def account():
    return render_template('account.html')

@app.route('/wishlist')
def wishlist():
    return render_template('wishlist.html')

@app.route('/checkout')
def checkout():
    cart = session.get('cart', [])
    return render_template('checkout.html', cart=cart)

@app.route('/cart')
def cart():
    cart = session.get('cart', [])
    return render_template('cart.html', cart=cart)

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    cart = session.get('cart', [])
    cart.append(data)
    session['cart'] = cart
    return jsonify({'status': 'success', 'cart': cart})

if __name__ == '__main__':
    app.run(debug=True)