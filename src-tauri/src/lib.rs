use std::fs;

/// Read yingling_seed.json from the same directory as the exe
#[tauri::command]
fn read_seed_file() -> Option<String> {
    let dir = std::env::current_exe().ok()?.parent()?.to_path_buf();
    fs::read_to_string(dir.join("yingling_seed.json")).ok()
}

/// Write yingling_seed.json next to the exe, returns true on success
#[tauri::command]
fn write_seed_file(data: String) -> bool {
    if let Some(dir) = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.to_path_buf()))
    {
        return fs::write(dir.join("yingling_seed.json"), data.as_bytes()).is_ok();
    }
    false
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_seed_file, write_seed_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
