import { Produit } from "../models/produits.js";
import { User } from "../models/users.js";
import { Payment } from "../models/Payment.js";

export const ajouterCommandePoints = async (req , res)=>{
    try{
     const idClient = req.params.idclient;
     const idVandeur = req.params.idvendeur;
     const idProduit = req.params.idproduit;  
   
  
    const client = await User.findById(idClient);
    const vendeur = await User.findById(idVandeur);
    const produit = await Produit.findById(idProduit);

    if(client.points>=produit.price){
     
    const {ville , numRue , adresseLigne2 , codePoastal} = req.body;
    
    const newPayment = new Payment({ville, numRue, adresseLigne2, codePoastal , produit : idProduit}); 
    const payment = await newPayment.save();
    await User.findByIdAndUpdate(idClient , {
        points : client.points-produit.price
      },
      {new : true}
       )
       await User.findByIdAndUpdate(idVandeur , {
        points : vendeur.points + produit.price ,
      },
      {new : true}
      )
      await Produit.findByIdAndUpdate(idProduit , {
        vende : true ,
      },
      {new : true}
      )
    try{
    await User.findByIdAndUpdate(idClient , {
        $push : {payment : payment._id+" "+produit._id} 
    })
  
    }catch(error){
        res.status(500).json({message: error.message});
    }
   
    res.status(200).json({message : "success"});
} else {
    res.status(402).json({message : "Vous n'avez pas assez de points"});
}
 }catch(error){
        res.status(500).json({message: error.message});
    }
}

//get liste commande

export const getMyCommande = async (req, res)=>{
    try{
      const id = req.params.id;
      const Me = await User.findById(id);
    const allMyCommands = [];
    var s = 0;
    const produits = [];
    if(Me.payment.length<0){
        res.status(402).json({message : "Vous n'avez pas assez de commandes"});
    } else {
      for(let i=0 ; i<Me.payment.length ; i++){

    const commande = await Payment.findById(Me.payment[i].split(' ')[0]);
    s+=1;
    allMyCommands.push(commande);
    }
    
    for(let i =0 ; i<allMyCommands.length ; i++){
        const produit = await Produit.findById(allMyCommands[i].produit);
        produits.push(produit);
    }

    res.status(200).json({allMyCommands , produits} );
    }
    }catch(error){
        res.status(500).json({message: error.message});
    }
}
