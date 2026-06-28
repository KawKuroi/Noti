// Persistencia local de las preferencias de inicio de la app de escritorio.
// Vive en <app_config_dir>/config.json; se lee en el arranque (antes de que el
// webview cargue) y se actualiza desde los comandos set_*. Solo escritorio:
// el autoarranque y la bandeja no existen en movil.

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ConfigInicio {
    // Marca de primer arranque: la primera vez activamos el autoarranque por
    // defecto y luego dejamos de tocarlo (respeta la eleccion del usuario).
    pub inicio_configurado: bool,
    pub iniciar_minimizado: bool,
    pub cerrar_a_bandeja: bool,
}

impl Default for ConfigInicio {
    fn default() -> Self {
        Self {
            inicio_configurado: false,
            iniciar_minimizado: false,
            cerrar_a_bandeja: true,
        }
    }
}

fn ruta_config(app: &AppHandle) -> Option<std::path::PathBuf> {
    app.path()
        .app_config_dir()
        .ok()
        .map(|dir| dir.join("config.json"))
}

pub fn cargar(app: &AppHandle) -> ConfigInicio {
    let Some(ruta) = ruta_config(app) else {
        return ConfigInicio::default();
    };
    match std::fs::read_to_string(&ruta) {
        Ok(contenido) => serde_json::from_str(&contenido).unwrap_or_default(),
        Err(_) => ConfigInicio::default(),
    }
}

pub fn guardar(app: &AppHandle, cfg: &ConfigInicio) -> std::io::Result<()> {
    let ruta = ruta_config(app).ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "directorio de config no disponible",
        )
    })?;
    if let Some(dir) = ruta.parent() {
        std::fs::create_dir_all(dir)?;
    }
    let contenido = serde_json::to_string_pretty(cfg)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    std::fs::write(&ruta, contenido)
}
