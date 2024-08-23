from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF
import json
import io
import os

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

def hex_to_rgb(hex_color):
    # Convert hex color to RGB (0-1 scale)
    hex_color = hex_color.lstrip('#')
    return [int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4)]
  
def getMetadataString(shape):
    if shape['metadata']:
        metadata_string = ""
        for key, value in shape['metadata'].items():
            metadata_string += f"{key.capitalize()}: {value}\n"
        return metadata_string
    return "None"

def add_shapes_to_pdf(input_file, ftype, shapes):
    # Open the PDF
    if ftype != "pdf":
        # Convert image to PDF
        doc = fitz.open()
        img = fitz.open(stream=input_file, filetype=ftype)
        pdfbytes = img.convert_to_pdf()
        img.close()

        # Open the converted PDF
        doc = fitz.open("pdf", pdfbytes)
    else:
        # Open the existing PDF
        doc = fitz.open(stream=input_file, filetype="pdf")

    # Iterate through each page (assuming shapes are for the first page only)
    page = doc[0]
    page_width = page.rect.width
    page_height = page.rect.height
    app.logger.info(f'page_width: {page_width}, page_height: {page_height}')
    
    for shape in shapes:
        # Extract shape information
        shape_id = shape['id']
        shape_type = shape['shape']
        color = hex_to_rgb(shape['color'])
        scale = 1.0 if ftype == 'pdf' else 0.5 
        x = shape['start_x_pos'] * scale
        y = shape['start_y_pos'] * scale
        app.logger.info(f'shape type: {shape_type} --> x: {x}, y: {y}')
        width = shape['width'] * scale
        height = shape['height'] * scale
        title = shape['title']
        metadata_string = getMetadataString(shape)
        
        # Mirror flip the x coordinate
        mirrored_x = page_width - (x + width)
        
        # Create annotation
        if page_width > 1500:
            rect = fitz.Rect(y, mirrored_x, y + height, mirrored_x + width)
        else :
            # rect = fitz.Rect(y, mirrored_x, y + height, mirrored_x + width)
            # rect = fitz.Rect(y, mirrored_x, y + height, mirrored_x + width)
            rect = fitz.Rect(x, y, x + width, y + height)
        
        if shape_type == 'rectangle':
            annot = page.add_rect_annot(rect)
        elif shape_type == 'circle':
            annot = page.add_circle_annot(rect)
        else:
            print(f"Unsupported shape type: {shape_type} for id: {shape_id}")
            continue
        
        # Set annotation properties
        annot.set_colors(stroke=color, fill=color)
        annot.set_opacity(0.5)
        annot.set_border(width=1)  # 1pt border width
        annot.set_info(title=title, content=metadata_string)
        annot.update()
        
        pos = (y, mirrored_x + width)
        page.add_text_annot(pos, f"Metadata for {title}:\n\n{metadata_string}", icon="Note")
    
    # Save the modified PDF to a byte stream
    output_stream = io.BytesIO()
    doc.save(output_stream)
    doc.close()
    
    return output_stream.getvalue()

@app.route('/annotate_pdf', methods=['POST'])
def annotate_pdf():
    if 'file' not in request.files or 'shapes' not in request.form:
        return 'Missing file or shapes data', 400
    
    file = request.files['file']
    ftype = request.form['ftype']
    file_type = ftype.split('/')[-1]
    app.logger.info(f'ftype: {ftype}')
    shapes = json.loads(request.form['shapes'])
    
    if file.filename == '':
        return 'No selected file', 400
    
    if file:
        input_pdf = file.read()
        output_pdf = add_shapes_to_pdf(input_pdf, file_type, shapes)
        
        return send_file(
            io.BytesIO(output_pdf),
            mimetype='application/pdf',
            as_attachment=True,
            download_name='annotated.pdf'
        )

@app.route('/test', methods=['GET'])
def test_route():
    return jsonify(message="GET request successful!", status="success")

if __name__ == '__main__':
    use_https = os.environ.get('USE_HTTPS', 'false').lower() == 'true'
    
    if use_https:
        ssl_context = (
            '/app/https-keys/fullchain.pem',
            '/app/https-keys/privkey.pem'
        )
        app.run(host='0.0.0.0', port=5000, ssl_context=ssl_context)
    else:
        app.run(host='0.0.0.0', port=5000)
