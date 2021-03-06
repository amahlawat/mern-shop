import React, { Component } from 'react';
import axios from 'axios';

import Button from '../../components/Button/Button';
import './AddProduct.css';
import FilePicker from '../../components/Form/Input/FilePicker';
import { generateBase64FromImage } from '../../utils/image';
import Image from '../../components/Image/Image';

var productInitial = {
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        imagePreview: null    
};

class AddProduct extends Component{
    state = { 
        product: { ...productInitial },
        isEdit: window.location.pathname.includes("edit")
    }

    async componentDidMount(){
        if(this.state.isEdit){
            // console.log("token ", this.props.token);
            let pathname = window.location.pathname;
            let productId = pathname.replace("/edit-product/", "");        
            try{
                // fetch single product data
                let response = await axios.get(`http://localhost:8081/product/${productId}`, {
                    headers: {
                        Authorization: 'Bearer ' + this.props.token
                    }
                });
                if(response.status !== 200 && response.status !== 201){
                    throw new Error('fetching single product failed');
                }
                let product = { ...this.state.product };
                product.title = response.data.product.title;
                product.description = response.data.product.description;
                product.price = response.data.product.price;
                product.imagePreview = `http://localhost:8081/${response.data.product.imageUrl}`;
                this.setState({ product });
            }catch(error){
                console.log(error);
            }
        }
    }

    update = async() => {
        const formData = new FormData();
        formData.append("title", this.state.product.title);
        formData.append("description", this.state.product.description);
        formData.append("price", this.state.product.price);
        formData.append("image", this.state.product.imageUrl);
        let pathname = window.location.pathname;
        let productId = pathname.replace("/edit-product/", "");
        // for(let keyValuePair of formData.entries()){
        //     console.log(keyValuePair); 
        // }

        fetch(`http://localhost:8081/update-product/${productId}`, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: 'Bearer '+this.props.token
            }
        })
        .then(res => {
            if(res.status !== 200 && res.status !== 201){
                throw new Error('creating product failed')
            }
            return res.json();
        }) 
        .then(resData => {
            this.clear();
            // console.log(resData);
        })
        .catch(err => {
            console.log(err);
        })

    }

    save = async() => {
        const formData = new FormData();
        formData.append("title", this.state.product.title);
        formData.append("description", this.state.product.description);
        formData.append("price", this.state.product.price);
        formData.append("image", this.state.product.imageUrl);

        fetch('http://localhost:8081/add-product', {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: 'Bearer '+this.props.token
            }
        })
        .then(res => {
            if(res.status !== 200 && res.status !== 201){
                throw new Error('creating product failed')
            }
            return res.json();
        }) 
        .then(resData => {
            this.clear();
        })
        .catch(err => {
            console.log(err);
        })
    }
    
    clear = () => {
        this.setState({ product: { ...productInitial }});
    }
    
    changeHandler = (event, attr) => {
        let product = {...this.state.product};
        if(event.target.value !== ""){
            product[attr]= event.target.value
            this.setState({ product });
        }
    }

    fileInputChangeHandler = (input, value, files) => {
        if(files){
            generateBase64FromImage(files[0])
            .then(b64 => {
                let product = { ...this.state.product };
                product.imagePreview = b64;
                this.setState({ product });
            })
            .catch(e => {
                let product = { ...this.state.product };
                product.imagePreview = null;
                this.setState({ product });
            });
        }
        let product = {...this.state.product};
        product.imageUrl = files[0];
        this.setState({ product });
    }

    render(){
        let {
            title,
            description,
            price,
            imagePreview
        } = this.state.product;
        // console.log("imagePreview ", imagePreview);
        return(
            <div className="add-product">
                <input type="text" placeholder="enter title" name="title" className="title" 
                    value={title} onChange={event => this.changeHandler(event, "title")} />
                <input type="number" placeholder="enter price" name="price" className="price" 
                    value={price} onChange={event => this.changeHandler(event, "price")} />
                <FilePicker 
                    id="image"
                    label="image"
                    control="input"
                    onChange={this.fileInputChangeHandler}
                />
                <div className="add-product__preview-image">
                    {!imagePreview && <p>Please choose an image</p>}
                    {imagePreview && (
                        <Image imageUrl={imagePreview} contain left />
                    )}
                </div>
                <textarea cols="15" rows="3" placeholder="enter description" value={description} onChange={event => this.changeHandler(event, "description")}/>    
                <div className="btns">
                    <Button title="Clear" clickHandler={this.clear} />
                    {this.state.isEdit ? 
                        <Button title="Update"  clickHandler={this.update} />:
                        <Button title="Save"  clickHandler={this.save} />                    
                    }
                </div>
            </div>
        )
    }
}

export default AddProduct;