const mongoose = require("mongoose");

const objectifSchema = new mongoose.Schema({
    utilisateur_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateur",
        required: true
    },
    typeConsommation: {
        type: String,
        required: true
    },
    valeurCible: {
        type: Number,
        required: true
    },
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    }
}, { timestamps: true });

/* Méthodes */

// définirObjectif()
objectifSchema.statics.definirObjectif = async function(data) {
    const objectif = new this(data);
    return await objectif.save();
};

// vérifierAtteinte()
objectifSchema.methods.verifierAtteinte = function(valeurActuelle) {
    return valeurActuelle <= this.valeurCible;
};

module.exports = mongoose.model("Objectif", objectifSchema);

