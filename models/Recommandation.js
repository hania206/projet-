const mongoose = require("mongoose");

const recommandationSchema = new mongoose.Schema({
    utilisateur_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateur",
        required: true
    },
    typeConseil: {
        type: String,
        required: true
    },
    texteConseil: {
        type: String,
        required: true
    },
    statut: {
        type: String,
        enum: ["Appliqué", "Ignoré"],
        default: "Ignoré"
    },
    dateCreation: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

/* Méthodes */

// générer()
recommandationSchema.statics.generer = async function(data) {
    const recommandation = new this(data);
    return await recommandation.save();
};

// changerStatut()
recommandationSchema.methods.changerStatut = async function(nouveauStatut) {
    this.statut = nouveauStatut;
    return await this.save();
};

module.exports = mongoose.model("Recommandation", recommandationSchema);

