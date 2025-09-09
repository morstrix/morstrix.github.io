from flask_frozen import Freezer
from app import app

# Создаем экземпляр Freezer
freezer = Freezer(app)
# Указываем, что статические файлы нужно сохранить в папку 'build'
app.config['FREEZER_DESTINATION'] = 'build'

if __name__ == '__main__':
    freezer.freeze()