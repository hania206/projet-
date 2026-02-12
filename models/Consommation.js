const mongoose = require("mongoose");

const consommationSchema = new mongoose.Schema({
    utilisateur_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateur",
        required: true
    },
    type: {
        type: String,
        enum: ["Electricite", "Eau", "Dechets"],
        required: true
    },
    valeur: {
        type: Number,
        required: true
    },
    unite: {
        type: String,
        required: true
    },
    dateSaisie: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

/* Méthodes */

// enregistrer()
consommationSchema.statics.enregistrer = async function(data) {
    const consommation = new this(data);
    return await consommation.save();
};

// calculerImpact()
consommationSchema.methods.calculerImpact = function() {
    // Exemple بسيط لحساب impact
    if (this.type === "Electricite") {
        return this.valeur * 0.5;
    }
    if (this.type === "Eau") {
        return this.valeur * 0.2;
    }
    if (this.type === "Dechets") {
        return this.valeur * 0.8;
    }
};

module.exports = mongoose.model("Consommation", consommationSchema);

