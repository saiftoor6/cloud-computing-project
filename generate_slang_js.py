import csv
import json
import os

def convert_slang_to_js():
    # Paths
    base_dir = os.getcwd()
    slang_path = os.path.join(base_dir, 'slang.txt')
    output_path = os.path.join(base_dir, 'frontend', 'js', 'slangData.js')
    
    print(f"Reading from: {slang_path}")
    
    slang_dict = {}
    try:
        with open(slang_path, 'r', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter='=')
            for row in reader:
                if len(row) >= 2:
                    key = row[0].strip().upper()
                    value = row[1].strip()
                    slang_dict[key] = value
        
        print(f"Found {len(slang_dict)} entries.")
        
        # Write to JS file
        js_content = f"/**\n * Auto-generated from slang.txt\n * Direct mapping for offline translation\n */\nconst SLANG_DATA = {json.dumps(slang_dict, indent=4)};\n"
        
        with open(output_path, 'w', encoding='utf-8') as out_file:
            out_file.write(js_content)
            
        print(f"Successfully wrote to: {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert_slang_to_js()
