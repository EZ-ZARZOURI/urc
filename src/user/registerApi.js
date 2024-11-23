// src/user/registerApi.js
export function registerUser(newUser, onSuccess, onError) {
    fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
    })
    .then(async (response) => {
        if (response.ok) {
            const result = await response.json();
            onSuccess(result);
        } else {
            const errorData = await response.json();
            onError(new Error(errorData.message || "Erreur lors de l'inscription"));
        }
    })
    .catch((error) => {
        onError(new Error(error.message || "Erreur réseau"));
    });
}
