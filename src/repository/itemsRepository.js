import axios from "axios";

export async function getAllItems() {
    try {
        const response = await axios.get('https://api.deadlock-api.com/v1/assets/items', { timeout: 5000 });
        const items = response.data.map(item => ({
            id: item.id,
            name: item.name,
            slot: item.item_slot_type ?? item.type ?? null,
            type: item.type ?? null,
            heroes: item.heroes ?? null,
            tier: item.item_tier ?? null,
            cost: item.cost ?? null,
            shopable: item.shopable ?? false,
            image: item.image_webp ?? item.image ?? null,
            description: item.description?.desc ?? null,
        }));
        return items;
    } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
    }
}

export async function getItemByHeroId(id) {
    try {
        let data;
        try {
            const response = await axios.get(`https://api.deadlock-api.com/v1/assets/items/by-hero/${id}`, { timeout: 5000 });
            data = response.data;
        } catch (error) {
            if (error.response?.status !== 404) throw error;
            const response = await axios.get('https://api.deadlock-api.com/v1/assets/items', { timeout: 5000 });
            data = response.data.filter(item => {
                const heroes = Array.isArray(item.heroes)
                    ? item.heroes
                    : item.heroes?.value;
                return Array.isArray(heroes) && heroes.includes(Number(id));
            });
        }

        const items = data.map(item => ({
            id: item.id,
            name: item.name,
            slot: item.item_slot_type ?? item.type ?? null,
            type: item.type ?? null,
            heroes: item.heroes ?? null,
            tier: item.item_tier ?? null,
            cost: item.cost ?? null,
            shopable: item.shopable ?? false,
            image: item.image_webp ?? item.image ?? null,
            description: item.description?.desc ?? null,
        }));
        return items;
    } catch (error) {
        console.error('Error fetching items by hero ID:', error);
        throw error;
    }
}

export async function getItemBySlotType(slot_type) {
    try {
        let data;
        try {
            const response = await axios.get(`https://api.deadlock-api.com/v1/assets/items/by-slot-type/${slot_type}`, { timeout: 5000 });
            data = response.data;
        } catch (error) {
            if (error.response?.status !== 404 && error.response?.status !== 400) throw error;
        }

        //tomt
        data = [];

        const items = data.map(item => ({
            id: item.id,
            name: item.name,
            slot: item.item_slot_type ?? item.type ?? null,
            type: item.type ?? null,
            heroes: item.heroes ?? null,
            tier: item.item_tier ?? null,
            cost: item.cost ?? null,
            shopable: item.shopable ?? false,
            image: item.image_webp ?? item.image ?? null,
            description: item.description?.desc ?? null,
        }));
        return items;
    } catch (error) {
        console.error('Error fetching items by type:', error);
        throw error;
    }
}

export async function getItemByType(type) {
    try {
        const response = await axios.get(`https://api.deadlock-api.com/v1/assets/items/by-type/${type}`, { timeout: 5000 });
        const data = response.data;

        const items = data.map(item => ({
            id: item.id,
            name: item.name,
            slot: item.item_slot_type ?? item.type ?? null,
            type: item.type ?? null,
            heroes: item.heroes ?? null,
            tier: item.item_tier ?? null,
            cost: item.cost ?? null,
            shopable: item.shopable ?? false,
            image: item.image_webp ?? item.image ?? null,
            description: item.description?.desc ?? null,
        }));
        return items;
    } catch (error) {
        console.error('Error fetching items by type:', error);
        throw error;
    }
}

export async function getItemById(id) {
    try {
        const response = await axios.get(`https://api.deadlock-api.com/v1/assets/items/${id}`, { timeout: 5000 });
        const item = response.data;

        return {
            id: item.id,
            name: item.name,
            slot: item.item_slot_type,
            type: item.type ?? null,
            heroes: item.heroes ?? null,
            tier: item.item_tier,
            cost: item.cost ?? null,
            shopable: item.shopable,
            image: item.image_webp ?? item.image ?? null,
            description: item.description?.desc ?? null,
        };
    } catch (error) {
        console.error('Error fetching item by ID:', error);
        throw error;
    }
}
