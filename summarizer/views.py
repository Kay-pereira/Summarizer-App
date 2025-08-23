from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
import fitz  # PyMuPDF
import docx
from pptx import Presentation
import openai
from decouple import config
import traceback
from .models import summarydb


openai.api_key = config("OPEN_AI_API_KEY")


class SummarizeView(APIView):

    parser_classes = [MultiPartParser]

    def post(self, request, format=None):

        try:
            file = request.FILES.get('file')
            print("📁 File received:", file)

            if not file:
                print("🚫 No file uploaded.")
                return Response({'error': 'No file uploaded'}, status=400)

            ext = file.name.lower()
            print("📄 File extension:", ext)

            if ext.endswith('.pdf'):
                text = self.extract_pdf(file)
            elif ext.endswith('.docx'):
                text = self.extract_docx(file)
            elif ext.endswith('.pptx'):
                text = self.extract_pptx(file)
            else:
                print("❌ Unsupported file type.")
                return Response({'error': 'Unsupported file type'}, status=400)

            print("📝 Extracted text length:", len(text))
            if len(text.strip()) == 0:
                return Response({'error': 'File has no readable text.'}, status=400)

            # Summarize (limit to 4000 chars to avoid OpenAI overload)
            summary = self.get_summary(text[:4000])

            # Saving to DB
            summarydb.objects.create(
                file_name=file.name,
                original_text=text [:4000],
                summary_text=summary["summary"]
            )

            print("Summary received.")
            return Response(summary, status=200)

        except Exception as e:
            error_trace = traceback.format_exc()
            print("❌ Exception occurred:", str(e))
            print(error_trace)
            return Response(
                {'error': str(e), 'trace': error_trace},
                status=500
            )

    def extract_pdf(self, file):
        try:
            data = file.read()
            print("📦 PDF file size:", len(data))
            doc = fitz.open(stream=data, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            print("❌ PDF extraction failed:", e)
            raise

    def extract_docx(self, file):
        try:
            doc = docx.Document(file)
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            print("❌ DOCX extraction failed:", e)
            raise

    def extract_pptx(self, file):
        try:
            prs = Presentation(file)
            text = ""
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text += shape.text + "\n"
            return text
        except Exception as e:
            print("❌ PPTX extraction failed:", e)
            raise

    def get_summary(self, text):
        prompt = f"Please provide an overview and a detailed summary of the following lesson content:\n\n{text}"

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful teaching assistant."},
                    {"role": "user", "content": prompt}
                ]
            )
            result = response.choices[0].message.content
            return {
                "overview": result.split("\n")[0],
                "summary": result
            }
        except Exception as e:
            print("❌ OpenAI API error:", str(e))
            raise


class SummaryListView(APIView):
    def get(self, request):
        summaries = summarydb.objects.order_by('-created_at').values(
            "file_name", "summary_text", "created_at"
        )
        return Response(list(summaries), status=200)
