use std::process::{Command, exit};
use clap::{Parser, Subcommand};
use std::path::PathBuf;
use std::env;

#[derive(Parser)]
#[command(name = "kspanel")]
#[command(about = "KS Panel CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Starts the panel
    Launch {
        /// Port to listen on
        #[arg(short, long, default_value_t = 8080)]
        port: u16,
    },
    /// Runs database seeders
    Seed,
    /// Create a new admin user
    #[command(name = "create:user")]
    CreateUser {
        #[arg(long)]
        username: Option<String>,
        #[arg(long)]
        email: Option<String>,
        #[arg(long)]
        password: Option<String>,
    },
}

fn find_panel_dir() -> PathBuf {
    // 1. Check current directory
    let cwd = env::current_dir().expect("Failed to get current directory");
    if cwd.join("panel").exists() {
        return cwd.join("panel");
    }

    // 2. Check if we are currently inside the panel directory
    if cwd.join("index.js").exists() && cwd.join("package.json").exists() {
        // Simple heuristic to see if we are in panel
        if let Some(name) = cwd.file_name() {
            if name == "panel" {
                return cwd;
            }
        }
    }

    // 3. Check directory of the executable
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            if exe_dir.join("panel").exists() {
                return exe_dir.join("panel");
            }
        }
    }

    // Fallback: search upwards
    let mut current = cwd.as_path();
    while let Some(parent) = current.parent() {
        if parent.join("panel").exists() {
            return parent.join("panel");
        }
        current = parent;
    }

    eprintln!("Error: 'panel' directory not found. Please run this from the project root or ensure 'panel' is next to the executable.");
    exit(1);
}

fn main() {
    let cli = Cli::parse();
    let panel_dir = find_panel_dir();

    match &cli.command {
        Commands::Launch { port } => {
            println!("Starting KS Panel on port {}...", port);
            let status = Command::new("node")
                .arg("index.js")
                .env("PORT", port.to_string())
                .current_dir(&panel_dir)
                .status()
                .expect("Failed to start panel");

            if !status.success() {
                exit(status.code().unwrap_or(1));
            }
        }
        Commands::Seed => {
            println!("Running database seeders...");
            let status = Command::new("node")
                .arg("exec/seed.js")
                .current_dir(&panel_dir)
                .status()
                .expect("Failed to run seeder");

            if !status.success() {
                exit(status.code().unwrap_or(1));
            }
        }
        Commands::CreateUser { username, email, password } => {
            println!("Creating a new admin user...");
            let mut args = vec!["exec/createUser.js".to_string()];

            if let Some(u) = username {
                args.push(format!("--username={}", u));
            }
            if let Some(e) = email {
                args.push(format!("--email={}", e));
            }
            if let Some(p) = password {
                args.push(format!("--password={}", p));
            }

            let status = Command::new("node")
                .args(&args)
                .current_dir(&panel_dir)
                .status()
                .expect("Failed to run createUser script");

            if !status.success() {
                exit(status.code().unwrap_or(1));
            }
        }
    }
}
