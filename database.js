// Database handler using IndexedDB (since SQLite isn't available in browsers)
class CocktailDatabase {
  constructor() {
    this.dbName = "CocktailGalleryDB";
    this.dbVersion = 1;
    this.storeName = "cocktails";
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject("Failed to open database");
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes for better querying
          store.createIndex("name", "name", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
    });
  }

  async addCocktail(cocktail) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      const cocktailData = {
        ...cocktail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request = store.add(cocktailData);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject("Failed to add cocktail");
      };
    });
  }

  async getAllCocktails() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject("Failed to get cocktails");
      };
    });
  }

  async deleteCocktail(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject("Failed to delete cocktail");
      };
    });
  }

  async updateCocktail(id, updates) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      // First get the existing record
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingCocktail = getRequest.result;
        if (!existingCocktail) {
          reject("Cocktail not found");
          return;
        }

        const updatedCocktail = {
          ...existingCocktail,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const updateRequest = store.put(updatedCocktail);

        updateRequest.onsuccess = () => {
          resolve(updateRequest.result);
        };

        updateRequest.onerror = () => {
          reject("Failed to update cocktail");
        };
      };

      getRequest.onerror = () => {
        reject("Failed to get cocktail for update");
      };
    });
  }

  async searchCocktails(query) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const cocktails = request.result;
        const filtered = cocktails.filter(
          (cocktail) =>
            cocktail.name.toLowerCase().includes(query.toLowerCase()) ||
            cocktail.ingredients.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      };

      request.onerror = () => {
        reject("Failed to search cocktails");
      };
    });
  }

  async clearAllCocktails() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject("Failed to clear cocktails");
      };
    });
  }

  async getCocktail(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject("Failed to get cocktail");
      };
    });
  }
}

// Export for use in other files
window.CocktailDatabase = CocktailDatabase;
