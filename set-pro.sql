-- Mettre à jour le plan Pro pour l'utilisateur
UPDATE profils 
SET plan = 'pro' 
WHERE email = 'matheopote@outlook.fr';

-- Vérifier la mise à jour
SELECT id, email, plan FROM profils WHERE email = 'matheopote@outlook.fr';