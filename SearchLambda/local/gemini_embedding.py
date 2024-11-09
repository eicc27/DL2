import google.ai.generativelanguage as glm
import google.generativeai as genai
API_KEY = 'AIzaSyDVR3o60tCVvFGcduCzqvZNkH6Vs5T4meI'
genai.configure(api_key=API_KEY)

if __name__ == '__main__':
    model = 'models/embedding-001'
    embedding = genai.embed_content(task_type='retrieval_document', model=model, title='Focal Loss for Dense Object Detection', content='''
The highest accuracy object detectors to date are based on a two-stage approach popularized by R-CNN, where a classifier is applied to a sparse set of candidate object locations. In contrast, one-stage detectors that are applied over a regular, dense sampling of possible object locations have the potential to be faster and simpler, but have trailed the accuracy of two-stage detectors thus far. In this paper, we investigate why this is the case. We discover that the extreme foreground-background class imbalance encountered during training of dense detectors is the central cause. We propose to address this class imbalance by reshaping the standard cross entropy loss such that it down-weights the loss assigned to well-classified examples. Our novel Focal Loss focuses training on a sparse set of hard examples and prevents the vast number of easy negatives from overwhelming the detector during training. To evaluate the effectiveness of our loss, we design and train a simple dense detector we call RetinaNet. Our results show that when trained with the focal loss, RetinaNet is able to match the speed of previous one-stage detectors while surpassing the accuracy of all existing state-of-the-art two-stage detectors. Code is at: https://github.com/facebookresearch/Detectron.
''')
    