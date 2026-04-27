-- Ajout du champ plan dans la table profils
ALTER TABLE profils ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'gratuit';

-- Mise à jour des profils existants à 'gratuit'
UPDATE profils SET plan = 'gratuit' WHERE plan IS NULL;

-- Créer trigger pour auto-création du profil lors de l'inscription
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profils (id, email, plan)
  VALUES (NEW.id, New.email, 'gratuit')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();