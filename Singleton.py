# Singleton Pattern es un patrón de diseño que se utiliza para crear una clase única que solo puede existir una vez en memoria
# Es una clase abstracta que no se puede instanciar directamente, sino que se debe usar el método __new__ para crear una nueva instancia

class Singleton:
  # Singleton class
  __instance = {}
  # Singleton class constructor cls es el nombre de la clase || *args, **kwargs son los argumentos que se le pasan al constructor
  # se escribe **kwargs para que se pueda pasar cualquier cantidad de argumentos y se almacenan en forma de diccionario listados por su nombre o llave 
  # *args es para que se pueda pasar cualquier cantidad de argumentos y se almacenan en forma de lista
  def __new__(cls,*args, **kwargs):
    # Si la clase no esta en la instancia
    if cls not in cls.__instance:
      # __new__ es el constructor de la clase y se encarga de crear una nueva instancia de la clase si no existe una ya creada
      cls.__instance[cls] = super().__new__(cls)
    
    return cls.__instance[cls] # Se retorna la instancia de la clase
  
obj1 = Singleton()
obj2 = Singleton()

print(obj1 is obj2)                                                                    

# Se usaría para verificar que exista una sola conexión a la base de datos

import sqlite3
# la clase creada debe heredarse de Singleton || solo existe una instancia de la clase db1 y db2 son instancias de la clase DatabaseConnection
class DatabaseConnection(Singleton):
  connection = None # se inicializa cuando se usa el método connect()
  def connect(self):
  # def __init__(self):
    # super() asegura que se llama al constructor de la clase base Singleton
    super().__init__()
    if not self.connection:
      self.connection = sqlite3.connect('demo_db.db')
  def execute_q(self, query):
    cursor = self.connection.cursor()
    cursor.execute(query)
    
    # guardamos los cambios en la base de datos  como demo
    self.connection.commit()
    
  def close(self):
    self.connection.close()

# instancia de la clase DatabaseConnection
db = DatabaseConnection()
# se crea la conexión a la base de datos
db.connect()

db.execute_q('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)')

# instancia de la clase DatabaseConnection con una segunda conexión
db2 = DatabaseConnection()
# se inserta un registro en la tabla users
db2.execute_q('INSERT INTO users (name) VALUES ("John")')

print(f"Se compara las conexiones y el resultado es: {db.connection is db2.connection}")

db.close()