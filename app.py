from flask import Flask, render_template

app = Flask(__name__)

# Ваши ссылки
social_links = {
    'name': 'morstrix.gritspark',
    'links': [
        {'name': 'Instagram', 'url': 'https://www.instagram.com/morstrix.gritspark', 'icon': 'instagram'},
        {'name': 'Telegram Chat', 'url': 'https://t.me/+EAWKIhjtolsyYWVi', 'icon': 'telegram'},
        {'name': 'Telegram Bot', 'url': 'https://t.me/morstrixbot', 'icon': 'telegram'}
    ]
}

@app.route('/')
def home():
    return render_template('index.html', user=social_links)

if __name__ == '__main__':
    app.run(debug=True)