import React from "react";

// add css file of add_menu
import "./add_menu.css";

import db from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

// UploadButton 
import { UploadButton } from "../../utils/uploadthing";
import Container from "../../layout/container";

function AddMenu() {
    // Create menu collection if it doesn't exist
    const menuCollection = collection(db, "menu");
    const [imageKey, setImageKey] = React.useState("");

    async function handleAdd(menu_name: string, category: string, price: number, description: string, imageKey: string) {

        addDoc(menuCollection, {
            name: menu_name,
            category: category,
            price: price,
            description: description,
            imageKey: imageKey
        })
            .then(() => {
                console.log("Document successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const target = event.target as typeof event.target & {
            menu_name: { value: string };
            category: { value: string };
            price: { value: number };
            description: { value: string };
            image: { value: string };
        };

        const menu_name = target.menu_name.value;
        const category = target.category.value;
        const price = target.price.value;
        const description = target.description.value;
        const imageKey = target.image.value;

        // Add menu to database
        handleAdd(menu_name, category, price, description, imageKey);

        // Clear form
        target.menu_name.value = "";
        target.category.value = "";
        target.price.value = 0;
        target.description.value = "";
        target.image.value = "";
        setImageKey("");
    }

    
    return (
        <Container>
            <h1>Add Menu</h1>
            <form onSubmit={handleSubmit}>
                <ul>
                    <li>
                        <label htmlFor="menu_name">Menu Name</label>
                        <input type="text" id="menu_name" name="menu_name" required />
                    </li>
                    <li>
                        <label htmlFor="category">Category</label>
                        <select name="category" id="category">
                            <option value="Pizza">Pizza</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Desserts">Desserts</option>
                            <option value="Sides">Sides</option>
                        </select>
                    </li>
                    <li>
                        <label htmlFor="price">Price</label>
                        <input type="number" id="price" name="price" required />
                    </li>
                    <li>
                        <label htmlFor="description">Description</label>
                        <input type="text" id="description" name="description" required />
                    </li>
                    <li>
                        <label htmlFor="image">Image</label>
                        <UploadButton 
                        endpoint="imageUploader" 
                        onClientUploadComplete={(file) => {
                            setImageKey(file[0].key);
                        }}
                        onUploadAborted={() => {
                            alert("Upload aborted");
                        }} 
                        onUploadError={(error) => {
                            console.error(error, error.cause);alert("Upload failed");
                        }}/>
                        <input type="hidden" id="image" name="image" value={imageKey} />
                        <img src={"https://utfs.io/f/" + imageKey} alt="" />
                    </li>
                </ul>
                <button type="submit">Add Menu</button>
            </form>
        </Container>
    );
}

export default AddMenu;