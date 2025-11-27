const db = require('../firebaseConfig'); // Import database
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const COLLECTION_NAME = 'menus';

const isValid = (val) => val && val !== "" && !String(val).includes("{{");

// --- LOGIC UTAMA ---

exports.getAllMenus = async (req, res) => {
    try {
        // 1. AMBIL SEMUA DATA DARI FIREBASE
        const snapshot = await db.collection(COLLECTION_NAME).get();
        
        // Convert format Firebase ke Array biasa
        let result = snapshot.docs.map(doc => doc.data());

        const { q, category, min_price, max_price, max_cal, sort, page, per_page } = req.query;

        if (isValid(q)) {
            result = result.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
        }
        if (isValid(category)) {
            result = result.filter(item => item.category === category);
        }
        if (isValid(min_price) && !isNaN(min_price)) result = result.filter(item => item.price >= Number(min_price));
        if (isValid(max_price) && !isNaN(max_price)) result = result.filter(item => item.price <= Number(max_price));
        if (isValid(max_cal) && !isNaN(max_cal)) result = result.filter(item => item.calories <= Number(max_cal));

        // Sorting
        if (isValid(sort)) {
            const parts = sort.split(':');
            const field = parts[0]; 
            const order = parts[1] || 'asc'; 
            result.sort((a, b) => order === 'desc' ? b[field] - a[field] : a[field] - b[field]);
        }

        // Pagination
        const pageNum = (isValid(page) && !isNaN(page)) ? Number(page) : 1;
        const limit = (isValid(per_page) && !isNaN(per_page)) ? Number(per_page) : 10;
        const total = result.length;
        const total_pages = Math.ceil(total / limit) || 1; 
        const startIndex = (pageNum - 1) * limit;
        
        res.json({
            data: result.slice(startIndex, startIndex + limit),
            pagination: { total, page: pageNum, per_page: limit, total_pages }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMenu = async (req, res) => {
    try {
        let { name, category, calories, price, ingredients, description } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // AI Logic
        if (!description || description.trim() === "") {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Describe food: ${name} (${category}). Ingredients: ${ingredients}. One sentence.`;
                const result = await model.generateContent(prompt);
                description = result.response.text().trim();
            } catch (err) {
                description = "Delicious menu item";
            }
        }


        const snapshot = await db.collection(COLLECTION_NAME).orderBy('id', 'desc').limit(1).get();
        let newId = 1;
        if (!snapshot.empty) {
            newId = snapshot.docs[0].data().id + 1;
        }

        const newMenu = {
            id: newId, // Numeric ID
            name, category, 
            calories: Number(calories), 
            price: Number(price), 
            ingredients: ingredients || [], 
            description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };


        await db.collection(COLLECTION_NAME).doc(String(newId)).set(newMenu);

        res.status(201).json({ message: "Menu created", data: newMenu });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMenuById = async (req, res) => {
    try {
        const id = req.params.id; // String dari URL
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();

        if (!doc.exists) return res.status(404).json({ message: "Menu not found" });

        res.json({ data: doc.data() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMenu = async (req, res) => {
    try {
        const id = req.params.id;
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ message: "Menu not found" });

        const updatedData = {
            ...req.body,
            id: Number(id), // Jaga ID tetap number
            updated_at: new Date().toISOString()
        };

        await docRef.update(updatedData);

        const finalData = { ...doc.data(), ...updatedData };
        res.json({ message: "Menu updated", data: finalData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const id = req.params.id;
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ message: "Menu not found" });

        await docRef.delete();
        res.json({ message: "Menu deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// (Logic sama persis dengan getAllMenus, hanya routing beda)
exports.searchMenu = exports.getAllMenus; 

exports.groupByCategory = async (req, res) => {
    try {
        const { mode } = req.query;
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const menus = snapshot.docs.map(doc => doc.data()); // Data Array

        if (mode === 'count') {
            const counts = {};
            menus.forEach(m => counts[m.category] = (counts[m.category] || 0) + 1);
            return res.json({ data: counts });
        }
        if (mode === 'list') {
            const grouped = {};
            menus.forEach(m => {
                if (!grouped[m.category]) grouped[m.category] = [];
                grouped[m.category].push({ id: m.id, name: m.name, category: m.category, price: m.price });
            });
            return res.json({ data: grouped });
        }
        res.status(400).json({ message: "Invalid mode" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};