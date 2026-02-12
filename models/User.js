const mongoose = require("mongoose");

const utilisateurSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    motDePasse: {
        type: String,
        required: true
    },
    parametresFoyer: {
        nombrePersonnes: {
            type: Number,
            default: 1
        },
        surfaceMaison: {
            type: Number
        },
        ville: {
            type: String
        }
    },
    dateCreation: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

/* ============================
   Méthodes selon diagramme
============================ */

// s'inscrire()
utilisateurSchema.statics.inscrire = async function (data) {
    const utilisateur = new this(data);
    return await utilisateur.save();
};

// seConnecter()
utilisateurSchema.statics.seConnecter = async function (email, motDePasse) {
    return await this.findOne({ email, motDePasse });
};

// modifierProfil()
utilisateurSchema.methods.modifierProfil = async function (updates) {
    Object.assign(this, updates);
    return await this.save();
};

module.exports = mongoose.model("Utilisateur", utilisateurSchema);

